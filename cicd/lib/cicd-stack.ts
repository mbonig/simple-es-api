import cdk = require('@aws-cdk/core');
import { Pipeline, Artifact } from '@aws-cdk/aws-codepipeline';
import { GitHubSourceAction, CodeBuildAction, GitHubTrigger, CloudFormationCreateUpdateStackAction, S3DeployAction } from '@aws-cdk/aws-codepipeline-actions';
import { Project, BuildSpec, PipelineProject, LinuxBuildImage, ComputeType, BuildEnvironmentVariableType } from '@aws-cdk/aws-codebuild'
import { Capability } from '@aws-cdk/aws-ecs';
import { CloudFormationCapabilities } from '@aws-cdk/aws-cloudformation';
import { PolicyStatement, Effect, Role } from '@aws-cdk/aws-iam';
import { Bucket, BucketEncryption } from '@aws-cdk/aws-s3';
import { Version } from '@aws-cdk/aws-lambda';


export class CicdStack extends cdk.Stack {
  pipeline: Pipeline;
  projectName: string;

  static PASSTHROUGH_BUILDSPEC: any = {
    version: '0.2',
    phases: {
      build: {
        commands: [
          'env',
        ],
      },
    },
    artifacts: {
      'files': [
        '**/*',
      ],
    },
  };

  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    this.projectName = 'simple-es-cicd'
    this.setupCodePipeline();
  }
  
  setupCodePipeline() {
    const branch = this.node.tryGetContext('branch') || 'master';
    const owner = this.node.tryGetContext('owner');
    const repo = this.node.tryGetContext('repo');
    const oauthToken = this.node.tryGetContext('oauthToken');

    const githubSource = new Artifact('github-source');
    const deployArtifacts = new Artifact('cfn_templates')
    const lambdaPackage = new Artifact('lambda_package');

    const lambdaBucket = new Bucket(this, 'lambda-artifacts', { versioned: true })

    const project = new PipelineProject(this, `${this.projectName}-codebuild`, {
      buildSpec: BuildSpec.fromSourceFilename('api/buildspec.yaml'),
      environment: {
        buildImage: LinuxBuildImage.UBUNTU_14_04_NODEJS_10_14_1,
        computeType: ComputeType.SMALL,
        privileged: true,
        environmentVariables: {
          "S3_LAMBDA_BUCKET": { type: BuildEnvironmentVariableType.PLAINTEXT, value: lambdaBucket.bucketName }
        }
      }
    });

    const updateAPIStackAction = new CloudFormationCreateUpdateStackAction({
      actionName: 'deploy',
      templatePath: deployArtifacts.atPath('api/cdk.out/ApiStack.template.json'),
      adminPermissions: true,
      stackName: 'simple-es-model-api',
      capabilities: [CloudFormationCapabilities.NAMED_IAM],
      runOrder: 2
    });

    const githubSourceAction = new GitHubSourceAction({
      branch,
      owner,
      repo,
      oauthToken,
      output: githubSource,
      actionName: 'clone',
      trigger: GitHubTrigger.WEBHOOK
    });

    const codeBuildAction = new CodeBuildAction({
      actionName: 'build',
      input: githubSource,
      outputs: [deployArtifacts, lambdaPackage],
      project: project,
    });

    const s3DeployAction = new S3DeployAction({
      actionName: 'copy-lambdas',
      bucket: lambdaBucket,
      input: lambdaPackage,
      runOrder: 1
    });

    this.pipeline = new Pipeline(this, this.projectName, {
      stages: [
        {
          stageName: 'source',
          actions: [githubSourceAction]
        },
        {
          stageName: 'Build',
          actions: [
            codeBuildAction
          ]
        },
        {
          stageName: 'Deploy',
          actions: [
            s3DeployAction,
            updateAPIStackAction
          ]
        }
      ]
    });

    updateAPIStackAction.addToDeploymentRolePolicy(new PolicyStatement({
      actions: ["S3:GetObject"],
      resources: [`${lambdaBucket.bucketArn}/*`]
    }));
    
  }
}
