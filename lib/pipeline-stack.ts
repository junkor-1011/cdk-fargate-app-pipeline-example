import { Stack, StackProps, Stage } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as codecommit from 'aws-cdk-lib/aws-codecommit';
import * as pipelines from 'aws-cdk-lib/pipelines';

// import { TestAppStack } from '../lib/test-app-stack';
import { BackendStack } from '../lib/backend-stack';
import { FrontendStack } from '../lib/frontend-stack';

export class PipelineStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // The code that defines your stack goes here

    const repo = new codecommit.Repository(this, 'Repository', {
      repositoryName: 'test-webapp-pipeline-repo',
      description: 'test for cdk pipeline',
    });

    const pipeline = new pipelines.CodePipeline(this, 'Pipeline', {
      synth: new pipelines.ShellStep('Synth', {
        input: pipelines.CodePipelineSource.codeCommit(repo, 'main'),
        commands: [
          'yarn install --ignore-scripts',
          'yarn build',
          'yarn cdk synth PipelineStack BackendStack FrontendStack',
        ],
      }),
      codeBuildDefaults: {
        buildEnvironment: {
          privileged: true,
        },
      },
    });
    const devStage = new ApplicationStage(this, 'Dev', {
      stageName: 'dev',
    });
    const prodStage = new ApplicationStage(this, 'Prod', {
      stageName: 'prod',
    });
    pipeline.addStage(devStage);
    pipeline.addStage(prodStage, {
      pre: [new pipelines.ManualApprovalStep('PromoteToProd')],
    });
  }
}

// TODO: Stage VPC
type StageStackProps = StackProps & {
  stageName: string;
};

class ApplicationStage extends Stage {
  constructor(scope: Construct, id: string, props: StageStackProps) {
    super(scope, id, props);

    new BackendStack(this, 'BackendStack', {
      stageName: props.stageName,
    });
    new FrontendStack(this, 'FrontendStack', {
      stageName: props.stageName,
    });
  }
}
