# Useful commands

 * `npm run build`   compile typescript to js
 * `npm run watch`   watch for changes and compile
 * `cdk deploy`      deploy this stack to your default AWS account/region
 * `cdk diff`        compare deployed stack with current state
 * `cdk synth`       emits the synthesized CloudFormation template

## CICD for the API

I believe that one of the first problems you should solve in any new project is getting your code into the environment it needs to be. If you don't solve that first, you're always chasing your tail.

Included here is a CDK Stack for creating a CodePipeline pipeline. It will pull from a given Github Repo, build (call the CDK for the API stack) 
and then deploy it via CloudFormation.


## Secret OAuthToken

If the repository you're pulling from is private, or if you just want to follow good practices, create a new Secret in AWS's Secrets Manager:

[https://us-east-1.console.aws.amazon.com/secretsmanager/home]()

Give it any name you'd like. The value should be a simple plaintext key from [here](https://github.com/settings/tokens).

Pass that name in as a context variable:

` cdk synth -c oauthtoken_arn=<your secret's arn>`


## Deploying this CodePipeline

To deploy, make sure you can run basic AWS CLI commands and that your environment is setup correctly. Once you're sure you're using the right account:

```bash
cd cicd
STACK_NAME=my-api-stack cdk -c oauthtoken_arn=arn::your_secret_arn deploy 
```

You will be prompted to confirm the new IAM policies being created, and then the CDK will create a new CloudFormation stack called 'my-api-stack'.

If you do to not provide a `STACK_NAME` the default is 'cicd-simple-es-api'.


## Deploying multiple stacks

Use the `STACK_NAME` to deploy this CICD pipeline multiple times.


## License (MIT)

Copyright (c) 2019 Matthew Bonig

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.