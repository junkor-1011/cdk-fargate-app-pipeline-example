import type {
  APIGatewayAuthorizerEvent,
  // APIGatewayAuthorizerHandler,
  APIGatewayAuthorizerResult,
} from 'aws-lambda';

import { generatePolicy } from '../lib/utils';

/* eslint-disable-next-line @typescript-eslint/require-await */
export const lambdaHandler = async (event: APIGatewayAuthorizerEvent): Promise<APIGatewayAuthorizerResult> => {
  const res = generatePolicy('user', 'Allow', event.methodArn);
  return res;
};
