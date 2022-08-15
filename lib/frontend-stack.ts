import { Stack, StackProps, Duration } from 'aws-cdk-lib';
import { DockerImageAsset, NetworkMode } from 'aws-cdk-lib/aws-ecr-assets';
// import * as ssm from 'aws-cdk-lib/aws-ssm';
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

    // const vpcId = ssm.StringParameter.fromStringParameterAttributes(this, `vpcid-${props.stageName}`, {
    //   parameterName: `/TESTAPP/${props.stageName}/VPC_ID`,
    // }).stringValue;
    // const vpcId = ssm.StringParameter.valueFromLookup(this, `/TESTAPP/${props.stageName}/VPC_ID`)
    // const vpcId = ssm.StringParameter.valueForStringParameter(this, `/TESTAPP/${props.stageName}/VPC_ID`)
    /*
    const vpc = ec2.Vpc.fromLookup(this, `vpc-${props.stageName}`, {
      // vpcId,
      vpcName: `VpcStack/TestAppVpc-${props.stageName}`,
    });
    */
    const cidr = props.stageName === 'Dev' ? '10.2.0.0/18' : props.stageName === 'Prod' ? '10.3.0.0/18' : undefined;
    const vpc = new ec2.Vpc(this, `TestAppVpc-Dev`, {
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
          cidrMask: 28,
          name: `isolated-${props.stageName}`,
          subnetType: ec2.SubnetType.PRIVATE_ISOLATED,
        },
      ],
    });

    const cluster = new ecs.Cluster(this, `FargateCluster-${props.stageName}`, { vpc });

    const alb = new elbv2.ApplicationLoadBalancer(this, `ALB-${props.stageName}`, { vpc, internetFacing: true });
    const listener = alb.addListener(`Listener-${props.stageName}`, {
      port: 3000,
      protocol: elbv2.ApplicationProtocol.HTTP,
    });
    const tg = new elbv2.ApplicationTargetGroup(this, `TG-${props.stageName}`, {
      targetType: elbv2.TargetType.INSTANCE,
      port: 3000,
      protocol: elbv2.ApplicationProtocol.HTTP,
      stickinessCookieDuration: Duration.minutes(5),
      vpc,
    });

    listener.addTargetGroups(`add-tg-${props.stageName}`, {
      targetGroups: [tg],
    });

    const asset = new DockerImageAsset(this, 'NextjsAppImage', {
      directory: 'images/nextjs-app',
      networkMode: NetworkMode.HOST,
    });

    /*
    const taskDefinition = new ecs.FargateTaskDefinition(this, `${props.stageName}-TaskDef`, {
      memoryLimitMiB: 2048,
      cpu: 256,
    });
    const container = taskDefinition.addContainer('WebContainer', {
      image: ecs.ContainerImage.fromDockerImageAsset(asset),
      environment: {
        stageName: props.stageName,
      },
    });
    */
    const selection = vpc.selectSubnets({
      subnetType: ec2.SubnetType.PRIVATE_ISOLATED,
    });

    const service = new ecsPatterns.ApplicationLoadBalancedFargateService(this, `Service-${props.stageName}`, {
      cluster,
      taskImageOptions: {
        image: ecs.ContainerImage.fromDockerImageAsset(asset),
        environment: {
          stageName: props.stageName,
        },
        secrets: {},
      },
      taskSubnets: {
        subnets: selection.subnets,
      },
      loadBalancer: alb,
    });

    /*
    const service = new ecs.FargateService(this, `Service-${props.stageName}`, {
      cluster,
      taskDefinition,
      cloudMapOptions: {
        cloudMapNamespace: cluster.addDefaultCloudMapNamespace(),
        container,
      }
    });

    service.registerLoadBalancerTargets(
      {
        containerName: `nextjs-app-${props.stageName}`,
        containerPort: 3000,
        newTargetGroupId: 'ECS',
        listener: ecs.ListenerConfig.applicationListener(listener, {
          protocol: elbv2.ApplicationProtocol.HTTP,
        }),
      },
    );
    */
  }
}
