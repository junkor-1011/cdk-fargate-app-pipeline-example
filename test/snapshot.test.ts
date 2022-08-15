import * as cdk from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { BackendStack } from '../lib/backend-stack';
import { FrontendStack } from '../lib/frontend-stack';
import { PipelineStack } from '../lib/pipeline-stack';

describe('snapshot test', () => {
  it("PipelineStack's Snapshot test", () => {
    const app = new cdk.App();
    const stack = new PipelineStack(app, 'TestAppStack');
    const template = Template.fromStack(stack).toJSON();

    expect(template).toMatchSnapshot();
  });
  it("BackendStack's Snapshot test", () => {
    const app = new cdk.App();
    const stack = new BackendStack(app, 'BackendStack', {
      stageName: 'test',
    });
    const template = Template.fromStack(stack).toJSON();

    expect(template).toMatchSnapshot();
  });
  it("FrontendStack's Snapshot test", () => {
    const app = new cdk.App();
    const stack = new FrontendStack(app, 'FrontendStack', {
      stageName: 'test',
    });
    const template = Template.fromStack(stack).toJSON();

    expect(template).toMatchSnapshot();
  });
});
