import {
  Duration,
  Stack,
  StackProps,
  // aws_iam as iam,
  aws_apigateway as apigateway,
  aws_cognito as cognito,
} from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { Runtime } from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';

export class TestAppStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const pool = new cognito.UserPool(this, 'Pool');
    pool.addClient('app-client', {
      oAuth: {
        flows: {
          authorizationCodeGrant: true,
        },
        scopes: [cognito.OAuthScope.OPENID],
      },
      authFlows: { adminUserPassword: true }, // use cognitoIdp:adminInitiateAuth API
      generateSecret: false,
      refreshTokenValidity: Duration.hours(12),
    });

    const preTokenGenerationLambda = new NodejsFunction(this, 'preTokenGenerationLambda', {
      entry: 'functions/UserPoolTriggers/preTokenGeneration.ts',
      handler: 'lambdaHandler',
      runtime: Runtime.NODEJS_16_X,
    });

    pool.addTrigger(cognito.UserPoolOperation.PRE_TOKEN_GENERATION, preTokenGenerationLambda);

    const helloLambda = new NodejsFunction(this, 'Hello', {
      entry: 'functions/api-backends/hello/get.ts',
      handler: 'lambdaHandler',
      runtime: Runtime.NODEJS_16_X,
      timeout: Duration.seconds(30),
      // role: iamRoleForLambda,
      environment: {
        AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1',
      },
      memorySize: 128,
    });

    const cognitoAuthorizer = new apigateway.CognitoUserPoolsAuthorizer(this, 'cognitoAuthorizer', {
      authorizerName: 'CognitoAuthorizer',
      cognitoUserPools: [pool],
    });

    const helloApi = new apigateway.RestApi(this, 'helloApigateway', {
      restApiName: `testapp-apigateway`,
    });

    const sample = helloApi.root.addResource('hello').addMethod('GET', new apigateway.LambdaIntegration(helloLambda), {
      authorizer: cognitoAuthorizer,
    });
  }
}
