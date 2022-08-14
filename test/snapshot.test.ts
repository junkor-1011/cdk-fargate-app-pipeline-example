import * as cdk from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { BackendStack } from '../lib/backend-stack';

describe('snapshot test', () => {
  it("TestApp Stack's Snapshot test", () => {
    const app = new cdk.App();
    const stack = new BackendStack(app, 'TestAppStack');
    const template = Template.fromStack(stack).toJSON();

    expect(template).toMatchSnapshot();
  });
});
