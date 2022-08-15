import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as ssm from 'aws-cdk-lib/aws-ssm';

const stageNames = {
  dev: 'Dev',
  prod: 'Prod',
};

export class VpcStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);
    const vpcDev = new ec2.Vpc(this, 'TestAppVpc-Dev', {
      cidr: '10.2.0.0/16',
      subnetConfiguration: [
        {
          cidrMask: 24,
          name: 'public-dev',
          subnetType: ec2.SubnetType.PUBLIC,
        },
        {
          cidrMask: 24,
          name: 'private-dev',
          subnetType: ec2.SubnetType.PRIVATE_WITH_NAT,
        },
        {
          cidrMask: 24,
          name: 'isolate-dev',
          subnetType: ec2.SubnetType.PRIVATE_ISOLATED,
        },
      ],
    });
    const vpcProd = new ec2.Vpc(this, 'TestAppVpc-Prod', {
      cidr: '10.3.0.0/16',
      subnetConfiguration: [
        {
          cidrMask: 24,
          name: 'public-prod',
          subnetType: ec2.SubnetType.PUBLIC,
        },
        {
          cidrMask: 24,
          name: 'private-prod',
          subnetType: ec2.SubnetType.PRIVATE_WITH_NAT,
        },
        {
          cidrMask: 24,
          name: 'isolate-prod',
          subnetType: ec2.SubnetType.PRIVATE_ISOLATED,
        },
      ],
    });

    // SSM ParameterStore
    new ssm.StringParameter(this, 'vpcid-dev', {
      parameterName: `/TESTAPP/${stageNames.dev}/VPC_ID`,
      stringValue: vpcDev.vpcId,
      type: ssm.ParameterType.STRING,
    });
    new ssm.StringParameter(this, 'vpcid-prod', {
      parameterName: `/TESTAPP/${stageNames.prod}/VPC_ID`,
      stringValue: vpcProd.vpcId,
      type: ssm.ParameterType.STRING,
    });
  }
}
