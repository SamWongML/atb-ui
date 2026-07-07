import { CfnOutput, Duration, RemovalPolicy, Stack, type StackProps } from "aws-cdk-lib";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import * as ecr from "aws-cdk-lib/aws-ecr";
import * as ecs from "aws-cdk-lib/aws-ecs";
import * as ecsPatterns from "aws-cdk-lib/aws-ecs-patterns";
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

    const service = new ecsPatterns.ApplicationLoadBalancedFargateService(this, "Service", {
      cluster,
      cpu: 512,
      memoryLimitMiB: 1024,
      // More than one task → a client's WebSocket is pinned to one task, so the
      // Redis backplane (Phase 1) is mandatory for cross-task fan-out.
      desiredCount: 2,
      publicLoadBalancer: true,
      // Zero-downtime rolling deploys with fast failure rollback.
      minHealthyPercent: 100,
      maxHealthyPercent: 200,
      circuitBreaker: { rollback: true },
      taskImageOptions: {
        image: ecs.ContainerImage.fromEcrRepository(repository, props.imageTag),
        containerPort: 3000,
        environment: {
          NODE_ENV: "production",
          PORT: "3000",
          HOSTNAME: "0.0.0.0",
        },
        logDriver: ecs.LogDrivers.awsLogs({ streamPrefix: "atb-console", logGroup }),
      },
    });

    // Keep long-lived SSE/WS connections alive and drain fast on deploy.
    service.loadBalancer.setAttribute("idle_timeout.timeout_seconds", "300");
    service.targetGroup.setAttribute("deregistration_delay.timeout_seconds", "10");
    service.targetGroup.configureHealthCheck({
      path: "/",
      healthyHttpCodes: "200-399",
      interval: Duration.seconds(30),
      timeout: Duration.seconds(5),
    });

    const scaling = service.service.autoScaleTaskCount({ minCapacity: 2, maxCapacity: 6 });
    scaling.scaleOnCpuUtilization("CpuScaling", { targetUtilizationPercent: 60 });

    new CfnOutput(this, "AlbUrl", {
      value: `http://${service.loadBalancer.loadBalancerDnsName}`,
    });
    new CfnOutput(this, "EcrRepositoryUri", { value: repository.repositoryUri });
  }
}
