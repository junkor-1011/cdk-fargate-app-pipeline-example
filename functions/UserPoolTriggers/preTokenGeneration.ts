import 'source-map-support/register';
import type { CognitoUserPoolTriggerEvent, CognitoUserPoolTriggerHandler, Context, Callback } from 'aws-lambda';

export const lambdaHandler = (event: CognitoUserPoolTriggerEvent, context: Context, callback: Callback) => {
  event.response = {
    claimsOverrideDetails: {
      claimsToAddOrOverride: {
        customKey1: 'custom-string',
        customKey2: 'red green blue',
        customKey3: 'apple orange grape',
      },
      groupOverrideDetails: {
        groupsToOverride: ['group-A', 'group-B', 'group-C'],
      },
    },
  };

  callback(null, event);
};
