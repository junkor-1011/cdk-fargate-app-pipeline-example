import { Stack, StackProps, aws_ecs as ecs } from 'aws-cdk-lib';
import { DockerImageAsset, NetworkMode } from 'aws-cdk-lib/aws-ecr-assets';
import { Construct } from 'constructs';

type StageStackProps = StackProps & {
  stageName: string;
};

export class FrontendStack extends Stack {
  constructor(scope: Construct, id: string, props: StageStackProps) {
    super(scope, id, props);

    const fargateTaskDefinition = new ecs.FargateTaskDefinition(this, `${props.stageName}-TaskDef`, {
      memoryLimitMiB: 2048,
      cpu: 256,
    });
    const asset = new DockerImageAsset(this, 'NextjsAppImage', {
      directory: 'images/nextjs-app',
      networkMode: NetworkMode.HOST,
    });
    const container = fargateTaskDefinition.addContainer('WebContainer', {
      image: ecs.ContainerImage.fromDockerImageAsset(asset),
      // ... other options here ...
    });
  }
}
