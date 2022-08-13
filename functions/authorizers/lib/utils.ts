import type { APIGatewayAuthorizerResult } from 'aws-lambda';

export const generatePolicy = (
  principal: string,
  effect: 'Allow' | 'Deny',
  resource: string,
): APIGatewayAuthorizerResult => {
  return {
    principalId: principal,
    policyDocument: {
      Version: '2012-10-17',
      Statement: [
        {
          Action: 'execute-api:Invoke',
          Effect: effect,
          Resource: resource,
        },
      ],
    },
  };
};

export const verifyToken = async (
  token: string,
  issuer: string,
  audience: string,
  jwksuri: string,
  /* eslint-disable-next-line */
): Promise<void> => {
  console.log(token, issuer, audience, jwksuri);
};
