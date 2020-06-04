import * as core from '@actions/core'
import {ArtifactDownloader} from './artifact-downloader'

async function run(): Promise<void> {
  try {
    const buildDefinitionId: number = Number(core.getInput('buildDefinitionId'))
    const projectId: string = core.getInput('projectId')
    const patToken: string = core.getInput('patToken')
    const orgName: string = core.getInput('orgName')
    const branchName: string = core.getInput('branchName')
    const commit: string = core.getInput('commit')
    const artifactName: string = core.getInput('artifactName')
    const targetDirectory: string = core.getInput('targetDirectory')
    const artifactDownloader = new ArtifactDownloader()
    artifactDownloader.download(
      projectId,
      buildDefinitionId,
      patToken,
      orgName,
      artifactName,
      branchName,
      commit,
      targetDirectory
    )
  } catch (error) {
    core.setFailed(error.message)
  }
}

run()
