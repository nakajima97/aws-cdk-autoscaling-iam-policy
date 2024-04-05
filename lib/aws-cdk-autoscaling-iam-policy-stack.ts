import * as cdk from 'aws-cdk-lib';
import { Vpc } from 'aws-cdk-lib/aws-ec2';
import { Construct } from 'constructs';

export class AwsCdkAutoscalingIamPolicyStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const vpc = new Vpc(this, 'VPC', {
      ipAddresses: cdk.aws_ec2.IpAddresses.cidr('10.0.0.0/16'),
      maxAzs: 2,
    });

    const securityGroup = new cdk.aws_ec2.SecurityGroup(this, 'SecurityGroup', {
      vpc,
      allowAllOutbound: true,
    });

    const iamRole = new cdk.aws_iam.Role(this, 'IAMRole', {
      assumedBy: new cdk.aws_iam.ServicePrincipal('ec2.amazonaws.com'),
      roleName: 'EC2Role',
      managedPolicies: [
        cdk.aws_iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonSSMManagedInstanceCore'),
      ],
    });

    const instanceProfile = new cdk.aws_iam.InstanceProfile(this, 'InstanceProfile', {
      role: iamRole,
      instanceProfileName: 'EC2Role'
    });

    const launchTemplate = new cdk.aws_ec2.LaunchTemplate(this, 'LaunchTemplate', {
      machineImage: cdk.aws_ec2.MachineImage.latestAmazonLinux2023(),
      instanceType: cdk.aws_ec2.InstanceType.of(cdk.aws_ec2.InstanceClass.T3, cdk.aws_ec2.InstanceSize.MICRO),
      securityGroup,
      instanceProfile,
    });

    const autoScalingGroup = new cdk.aws_autoscaling.AutoScalingGroup(this, 'ASG', {
      vpc,
      launchTemplate,
      minCapacity: 2,
    });

    const alb = new cdk.aws_elasticloadbalancingv2.ApplicationLoadBalancer(this, 'ALB', {
      vpc,
      internetFacing: true,
    });

    const listener = alb.addListener('Listener', {
      port: 80,
      open: true,
    });

    listener.addTargets('Target', {
      port: 80,
      targets: [autoScalingGroup],
    });
  }
}
