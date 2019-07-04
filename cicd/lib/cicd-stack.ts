import cdk = require('@aws-cdk/core');
import { Pipeline, Artifact } from '@aws-cdk/aws-codepipeline';
import { GitHubSourceAction, CodeBuildAction, GitHubTrigger } from '@aws-cdk/aws-codepipeline-actions';
import { Project, BuildSpec, PipelineProject, LinuxBuildImage, ComputeType } from '@aws-cdk/aws-codebuild'


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
    this.setupGithubSource();
    this.setupCodeBuildProject();
    this.setupCodePipeline();
  }
  setupGithubSource() {
  }
  setupCodeBuildProject() {
  }
  setupCodePipeline() {
    const branch = this.node.tryGetContext('branch') || 'master';
    const owner = this.node.tryGetContext('owner');
    const repo = this.node.tryGetContext('repo');
    const oauthToken = this.node.tryGetContext('oauthToken');

    const githubSource = new Artifact('github-source');
    const deployArtifacts = new Artifact('deploy-artifacts')

    this.pipeline = new Pipeline(this, this.projectName, {
      stages: [
        {
          stageName: 'source',
          actions: [new GitHubSourceAction({
            branch,
            owner,
            repo,
            oauthToken,
            output: githubSource,
            actionName: 'clone',
            trigger: GitHubTrigger.WEBHOOK
          })]
        },
        {
          stageName: 'Build',
          actions: [
            new CodeBuildAction({
              actionName: 'build',
              input: githubSource,
              outputs: [deployArtifacts],
              project: new PipelineProject(this, `${this.projectName}-codebuild`, {
                buildSpec: BuildSpec.fromSourceFilename('api/buildspec.yaml'),
                environment: {
                  buildImage: LinuxBuildImage.UBUNTU_14_04_NODEJS_10_14_1,
                  computeType: ComputeType.SMALL,
                  privileged: true
                },
              })
            })
          ]
        }
      ]
    });
  }
}
