import { CfnOutput, Duration, RemovalPolicy, Stack, type StackProps } from "aws-cdk-lib";
import * as codedeploy from "aws-cdk-lib/aws-codedeploy";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import * as ecr from "aws-cdk-lib/aws-ecr";
import * as ecs from "aws-cdk-lib/aws-ecs";
import * as ecsPatterns from "aws-cdk-lib/aws-ecs-patterns";
import * as elasticache from "aws-cdk-lib/aws-elasticache";
import * as elbv2 from "aws-cdk-lib/aws-elasticloadbalancingv2";
import * as logs from "aws-cdk-lib/aws-logs";
import type { Construct } from "constructs";

export interface AtbConsoleStackProps extends StackProps {
  /** Container image tag to deploy (CI passes the commit SHA). */
  readonly imageTag: string;
}

/**
 * ATB console on ECS Fargate behind an ALB (ARCHITECTURE.md §Deployment).
 * Bootstrap skeleton: a long-lived standalone Node container, provisioned for the
 * SSE/WS lifetimes the real-time spine needs. The Redis (ElastiCache) pub/sub
 * backplane for multi-task WebSocket fan-out is added in Phase 1.
 */
export class AtbConsoleStack extends Stack {
  constructor(scope: Construct, id: string, props: AtbConsoleStackProps) {
    super(scope, id, props);

    const vpc = new ec2.Vpc(this, "Vpc", { maxAzs: 2, natGateways: 1 });

    const repository = new ecr.Repository(this, "Repository", {
      repositoryName: "atb-console",
      imageScanOnPush: true,
      removalPolicy: RemovalPolicy.RETAIN,
      lifecycleRules: [{ maxImageCount: 20 }],
    });

    const cluster = new ecs.Cluster(this, "Cluster", {
      vpc,
      containerInsightsV2: ecs.ContainerInsights.ENABLED,
    });

    const logGroup = new logs.LogGroup(this, "LogGroup", {
      retention: logs.RetentionDays.TWO_WEEKS,
      removalPolicy: RemovalPolicy.DESTROY,
    });

    // Redis (ElastiCache) pub/sub backplane — mandatory for multi-task WebSocket
    // fan-out (ARCHITECTURE.md §"The critical production detail"). Every task
    // publishes/subscribes to per-session channels so any task can serve any client.
    const redisSecurityGroup = new ec2.SecurityGroup(this, "RedisSg", {
      vpc,
      description: "ATB Redis backplane",
      allowAllOutbound: false,
    });
    const redisSubnets = new elasticache.CfnSubnetGroup(this, "RedisSubnets", {
      description: "ATB Redis backplane subnets",
      subnetIds: vpc.privateSubnets.map((subnet) => subnet.subnetId),
    });
    const redis = new elasticache.CfnCacheCluster(this, "Redis", {
      engine: "redis",
      cacheNodeType: "cache.t4g.micro",
      numCacheNodes: 1,
      vpcSecurityGroupIds: [redisSecurityGroup.securityGroupId],
      cacheSubnetGroupName: redisSubnets.ref,
    });
    const redisUrl = `redis://${redis.attrRedisEndpointAddress}:${redis.attrRedisEndpointPort}`;

    const service = new ecsPatterns.ApplicationLoadBalancedFargateService(this, "Service", {
      cluster,
      cpu: 512,
      memoryLimitMiB: 1024,
      // More than one task → a client's WebSocket is pinned to one task, so the
      // Redis backplane (Phase 1) is mandatory for cross-task fan-out.
      desiredCount: 2,
      publicLoadBalancer: true,
      // Keep every task in service while CodeDeploy stands up the green fleet.
      minHealthyPercent: 100,
      // Blue-green cutover via CodeDeploy (ROADMAP Phase 5; ARCHITECTURE.md §Ship path).
      // CodeDeploy shifts traffic between two target groups and rolls back on alarm, so
      // the ECS-native circuit breaker does not apply here.
      deploymentController: { type: ecs.DeploymentControllerType.CODE_DEPLOY },
      taskImageOptions: {
        image: ecs.ContainerImage.fromEcrRepository(repository, props.imageTag),
        containerPort: 3000,
        environment: {
          NODE_ENV: "production",
          PORT: "3000",
          HOSTNAME: "0.0.0.0",
          REDIS_URL: redisUrl,
        },
        logDriver: ecs.LogDrivers.awsLogs({ streamPrefix: "atb-console", logGroup }),
      },
    });

    // Keep long-lived SSE/WS connections alive and drain fast on deploy.
    service.loadBalancer.setAttribute("idle_timeout.timeout_seconds", "300");
    service.targetGroup.setAttribute("deregistration_delay.timeout_seconds", "10");

    const healthCheck: elbv2.HealthCheck = {
      path: "/",
      healthyHttpCodes: "200-399",
      interval: Duration.seconds(30),
      timeout: Duration.seconds(5),
    };
    service.targetGroup.configureHealthCheck(healthCheck);

    // Blue-green cutover: CodeDeploy shifts prod traffic from the blue target group
    // (created by the pattern, on the prod :80 listener) to a green one, validated on a
    // separate test listener first, then rolls back on alarm (ARCHITECTURE.md §Ship path).
    const greenTargetGroup = new elbv2.ApplicationTargetGroup(this, "GreenTargetGroup", {
      vpc,
      port: 3000,
      protocol: elbv2.ApplicationProtocol.HTTP,
      targetType: elbv2.TargetType.IP,
      deregistrationDelay: Duration.seconds(10),
      healthCheck,
    });
    const testListener = service.loadBalancer.addListener("TestListener", {
      port: 9000,
      protocol: elbv2.ApplicationProtocol.HTTP,
      defaultTargetGroups: [greenTargetGroup],
    });

    new codedeploy.EcsDeploymentGroup(this, "BlueGreen", {
      service: service.service,
      blueGreenDeploymentConfig: {
        blueTargetGroup: service.targetGroup,
        greenTargetGroup,
        listener: service.listener,
        testListener,
        terminationWaitTime: Duration.minutes(5),
      },
      deploymentConfig: codedeploy.EcsDeploymentConfig.CANARY_10PERCENT_5MINUTES,
      autoRollback: { failedDeployment: true, stoppedDeployment: true },
    });

    // Let the Fargate tasks reach the Redis backplane on 6379.
    service.service.connections.allowTo(redisSecurityGroup, ec2.Port.tcp(6379), "Redis backplane");

    const scaling = service.service.autoScaleTaskCount({ minCapacity: 2, maxCapacity: 6 });
    scaling.scaleOnCpuUtilization("CpuScaling", { targetUtilizationPercent: 60 });

    new CfnOutput(this, "AlbUrl", {
      value: `http://${service.loadBalancer.loadBalancerDnsName}`,
    });
    new CfnOutput(this, "EcrRepositoryUri", { value: repository.repositoryUri });
  }
}
