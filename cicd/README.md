# Useful commands

 * `npm run build`   compile typescript to js
 * `npm run watch`   watch for changes and compile
 * `cdk deploy`      deploy this stack to your default AWS account/region
 * `cdk diff`        compare deployed stack with current state
 * `cdk synth`       emits the synthesized CloudFormation template


## Secret OAuthToken

If the repository you're pulling from is private, or if you just want to follow good practices, create a new Secret in AWS's Secrets Manager:

[https://us-east-1.console.aws.amazon.com/secretsmanager/home]()

Give it any name you'd like. The value should be

Pass that name in as a context variable:

` cdk synth -c oauthtoken_arn=<your secret's arn> `

