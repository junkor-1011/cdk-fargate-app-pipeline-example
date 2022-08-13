import 'source-map-support/register';

import type { APIGatewayAuthorizerEvent, APIGatewayAuthorizerResult } from 'aws-lambda';

import { generatePolicy, verifyToken } from '../lib/utils';
import { getParameter } from '../lib/aws-utils/ssm';

/**
 * modified APIGatewayAuthorizerEvent
 *
 * add authorizationToken
 */
type Event = APIGatewayAuthorizerEvent & {
  authorizationToken: string;
};

export const lambdaHandler = async (event: Event): Promise<APIGatewayAuthorizerResult> => {
  const type = event.type;
  console.log('type', type);
  const token = event.authorizationToken;
  const issuer = await getParameter('/TESTAPP/ISSUER', true);
  const audience = await getParameter('/TESTAPP/AUDIENCE', true);
  const jwksuri = await getParameter('/TESTAPP/JWKS_URI', true);
  await verifyToken(token, issuer, audience, jwksuri);

  const res = generatePolicy('user', 'Allow', event.methodArn);
  return res;
};
