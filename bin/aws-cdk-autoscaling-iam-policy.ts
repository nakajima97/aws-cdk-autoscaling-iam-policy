#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { AwsCdkAutoscalingIamPolicyStack } from '../lib/aws-cdk-autoscaling-iam-policy-stack';

const app = new cdk.App();
new AwsCdkAutoscalingIamPolicyStack(app, 'AwsCdkAutoscalingIamPolicyStack', {
});