import { Stack, StackProps, Duration } from 'aws-cdk-lib';
import { DockerImageAsset, NetworkMode } from 'aws-cdk-lib/aws-ecr-assets';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as ecsPatterns from 'aws-cdk-lib/aws-ecs-patterns';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as elbv2 from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import { Construct } from 'constructs';

type StageStackProps = StackProps & {
  stageName: string;
};

export class FrontendStack extends Stack {
  constructor(scope: Construct, id: string, props: StageStackProps) {
    super(scope, id, props);

    const cidr = props.stageName === 'Dev' ? '10.2.0.0/18' : props.stageName === 'Prod' ? '10.3.0.0/18' : undefined;
    const vpc = new ec2.Vpc(this, `TestAppVpc-${props.stageName}`, {
      cidr,
      subnetConfiguration: [
        {
          cidrMask: 24,
          name: `public-${props.stageName}`,
          subnetType: ec2.SubnetType.PUBLIC,
        },
        {
          cidrMask: 24,
          name: `private-${props.stageName}`,
          subnetType: ec2.SubnetType.PRIVATE_WITH_NAT,
        },
        {
          cidrMask: 24,
          name: `isolated-${props.stageName}`,
          subnetType: ec2.SubnetType.PRIVATE_ISOLATED,
        },
      ],
    });

    const cluster = new ecs.Cluster(this, `FargateCluster-${props.stageName}`, { vpc });

    const alb = new elbv2.ApplicationLoadBalancer(this, `ALB-${props.stageName}`, { vpc, internetFacing: true });

    const asset = new DockerImageAsset(this, 'NextjsAppImage', {
      directory: 'images/nextjs-app',
      networkMode: NetworkMode.HOST,
    });

    const selection = vpc.selectSubnets({
      subnetType: ec2.SubnetType.PRIVATE_WITH_NAT,
    });

    const service = new ecsPatterns.ApplicationLoadBalancedFargateService(this, `Service-${props.stageName}`, {
      cluster,
      taskImageOptions: {
        image: ecs.ContainerImage.fromDockerImageAsset(asset),
        containerPort: 3000,
        containerName: `app-container-${props.stageName}`,
        environment: {
          stageName: props.stageName,
        },
        secrets: {},
      },
      taskSubnets: {
        subnets: selection.subnets,
      },
      loadBalancer: alb,
      listenerPort: 80,
    });
  }
}
