import {APIGatewayAuthorizerResult} from "aws-lambda";
import {APIGatewayTokenAuthorizerEvent} from "aws-lambda/trigger/api-gateway-authorizer";

export const handler = async (event: APIGatewayTokenAuthorizerEvent): Promise<APIGatewayAuthorizerResult> => {
    console.log({event});
    return {
        principalId: "replace this",
        policyDocument: {
            "Version": "2012-10-17",
            "Statement": [
                {
                    "Action": "execute-api:Invoke",
                    "Effect": "Allow",
                    "Resource": event.methodArn
                }
            ]
        },
        context: {
            "some": "additionalContext"
        },
        usageIdentifierKey: "some api key"
    }
};
