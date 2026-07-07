#!/usr/bin/env node
import { App } from "aws-cdk-lib";
import { AtbConsoleStack } from "../lib/atb-stack";

const app = new App();

new AtbConsoleStack(app, "AtbConsoleStaging", {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION ?? "us-east-1",
  },
  // CI passes the built image tag (github.sha); defaults to the rolling staging tag.
  imageTag: process.env.IMAGE_TAG ?? "staging",
});

app.synth();
