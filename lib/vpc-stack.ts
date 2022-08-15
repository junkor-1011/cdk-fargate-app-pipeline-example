import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';

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
  }
}
