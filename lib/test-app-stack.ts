import {
  Duration,
  Stack,
  StackProps,
  // aws_iam as iam,
  // aws_apigateway as apigateway,
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
        // callbackUrls: ['http://localhost:3000/api/auth/callback/cognito'],
      },
      authFlows: { adminUserPassword: true }, // use cognitoIdp:adminInitiateAuth API
      generateSecret: false,
      refreshTokenValidity: Duration.hours(12),
    });
    /*
    pool.addDomain('CognitoDomain', {
      cognitoDomain: {
        // TODO: SHOULD GET VALUE FROM SSM PARAMETER OR SECRETS MANAGER
        domainPrefix: 'super-ultra-hyper-extreme-temporary-app', // TMP
      },
    });
    */

    const preTokenGenerationLambda = new NodejsFunction(this, 'preTokenGenerationLambda', {
      entry: 'functions/UserPoolTriggers/preTokenGeneration.ts',
      handler: 'lambdaHandler',
      runtime: Runtime.NODEJS_16_X,
    });

    pool.addTrigger(cognito.UserPoolOperation.PRE_TOKEN_GENERATION, preTokenGenerationLambda);

    /*
    const iamRoleForLambda = new iam.Role(this, 'iamRoleForLambda', {
      roleName: `hello-lambda-role`,
      assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
      managedPolicies: [iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaBasicExecutionRole')],
    });

    const helloLambda = new NodejsFunction(this, 'Hello', {
      entry: 'functions/hello/get.ts',
      handler: 'lambdaHandler',
      runtime: Runtime.NODEJS_16_X,
      timeout: Duration.seconds(30),
      role: iamRoleForLambda,
      environment: {
        AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1',
      },
      memorySize: 128,
    });

    const helloApi = new apigateway.RestApi(this, 'helloApigateway', {
      restApiName: `testapp-apigateway`,
    });

    const sample = helloApi.root.addResource('hello');
    const courseSearchIntegration = new apigateway.LambdaIntegration(helloLambda);
    sample.addMethod('GET', courseSearchIntegration);
    */
  }
}
