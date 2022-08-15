import * as cdk from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import * as TestApp from '../lib/backend-stack';

test('fine-grained test', () => {
  const app = new cdk.App();
  const stack = new TestApp.BackendStack(app, 'CognitoAppTestStack', {
    stageName: 'test',
  });
  // THEN
  const template = Template.fromStack(stack);

  template.resourceCountIs('AWS::Lambda::Function', 7);
  template.hasResourceProperties('AWS::ApiGateway::Resource', {
    PathPart: 'hello',
  });
});
