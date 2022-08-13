import {
  Duration,
  Stack,
  StackProps,
  aws_iam as iam,
  aws_apigateway as apigateway,
  aws_cognito as cognito,
} from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { Runtime } from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';

export class TestAppStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const readSSMParamLambdaRole = new iam.Role(this, 'ReadSSMParamLambdaRole', {
      assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
      description: 'Role for Lambda reading param from ssm',
    });
    readSSMParamLambdaRole.addManagedPolicy(
      iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaBasicExecutionRole'),
    );
    readSSMParamLambdaRole.addManagedPolicy(iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonSSMReadOnlyAccess'));

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
      bundling: {
        sourceMap: true,
      },
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

    const acceptTestLambda = new NodejsFunction(this, 'AcceptTest', {
      entry: 'functions/api-backends/lambda-authorizer-test/hello-accept/get.ts',
      handler: 'lambdaHandler',
      runtime: Runtime.NODEJS_16_X,
      timeout: Duration.seconds(30),
      environment: {
        AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1',
      },
      memorySize: 128,
      bundling: {
        sourceMap: true,
      },
    });

    const deniedTestLambda = new NodejsFunction(this, 'DeniedTest', {
      entry: 'functions/api-backends/lambda-authorizer-test/hello-denied/get.ts',
      handler: 'lambdaHandler',
      runtime: Runtime.NODEJS_16_X,
      timeout: Duration.seconds(30),
      environment: {
        AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1',
      },
      memorySize: 128,
      bundling: {
        sourceMap: true,
      },
    });

    const tokenAuthorizerColorLambda = new NodejsFunction(this, 'ColorAuthorizerLambda', {
      entry: 'functions/authorizers/color/index.ts',
      handler: 'lambdaHandler',
      runtime: Runtime.NODEJS_16_X,
      timeout: Duration.seconds(20),
      role: readSSMParamLambdaRole,
      bundling: {
        sourceMap: true,
      },
    });

    const tokenAuthorizerFruitsLambda = new NodejsFunction(this, 'FruitsAuthorizerLambda', {
      entry: 'functions/authorizers/fruits/index.ts',
      handler: 'lambdaHandler',
      runtime: Runtime.NODEJS_16_X,
      timeout: Duration.seconds(20),
      role: readSSMParamLambdaRole,
      bundling: {
        sourceMap: true,
      },
    });

    const cognitoAuthorizer = new apigateway.CognitoUserPoolsAuthorizer(this, 'cognitoAuthorizer', {
      authorizerName: 'CognitoAuthorizer',
      cognitoUserPools: [pool],
    });

    const colorAuthorizer = new apigateway.TokenAuthorizer(this, 'ColorAuthorizer', {
      handler: tokenAuthorizerColorLambda,
    });

    const fruitsAuthorizer = new apigateway.TokenAuthorizer(this, 'FruitsAuthorizer', {
      handler: tokenAuthorizerFruitsLambda,
    });

    const helloApi = new apigateway.RestApi(this, 'helloApigateway', {
      restApiName: `testapp-apigateway`,
    });

    const hello = helloApi.root.addResource('hello');
    hello.addMethod('GET', new apigateway.LambdaIntegration(helloLambda), {
      authorizer: cognitoAuthorizer,
    });
    const lambdaAuthorizerTest = helloApi.root.addResource('lambda-authorizer-test');
    lambdaAuthorizerTest
      .addResource('hello-accept')
      .addMethod('GET', new apigateway.LambdaIntegration(acceptTestLambda), {
        authorizer: colorAuthorizer,
      });
    lambdaAuthorizerTest
      .addResource('hello-denied')
      .addMethod('GET', new apigateway.LambdaIntegration(deniedTestLambda), {
        authorizer: fruitsAuthorizer,
      });
  }
}
