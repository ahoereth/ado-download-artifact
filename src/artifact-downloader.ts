import * as azdev from 'azure-devops-node-api'
import * as bi from 'azure-devops-node-api/interfaces/BuildInterfaces'
import * as fs from 'fs'

export class ArtifactDownloader {
  constructor() {}
  public async download(
    projectId: string,
    buildDefinitionId: number,
    patToken: string,
    orgName: string,
    artifactName: string,
    branchName: string,
    commit: string,
    targetDirectory: string
  ): Promise<void> {
    // base tfs url
    const baseTfsUrl = 'https://dev.azure.com'
    const orgUrl = `${baseTfsUrl}/${orgName}`

    // get auth handler
    let authHandler = azdev.getPersonalAccessTokenHandler(patToken)

    // get the connection to webapi
    let connection = new azdev.WebApi(orgUrl, authHandler)
    const buildApi = await connection.getBuildApi()

    // get top build for a particular definitions
    let builds = await buildApi.getBuilds(
      projectId, // projectId
      [buildDefinitionId], // definitions
      undefined, // queues
      undefined, // buildNumber
      undefined, // minTime
      undefined, // maxTime
      undefined, // requestedFor
      undefined, // reasonFilter
      undefined, // statusFilter
      undefined, // resultFilter
      undefined, // tagFilters
      undefined, // properties
      undefined, // top
      undefined, // continuationToken
      undefined, // maxBuildsPerDefinition
      undefined, // deletedFilter
      undefined, // queryOrder
      undefined, // branchName
      undefined, // buildIds
      undefined, // repositoryId
      undefined // repositoryType
    )
    if (commit) {
      builds = builds.filter(build => build.sourceVersion == commit)
    }
    const latestBuild = builds[0]
    console.log('Found build', latestBuild)

    targetDirectory = `${process.env.GITHUB_WORKSPACE}/${targetDirectory}`
    if (!fs.existsSync(targetDirectory)) {
      fs.mkdirSync(targetDirectory)
    }

    let artifactNames: (string | undefined)[] = [artifactName]

    if (!artifactName) {
      const buildArtifacts = await buildApi.getArtifacts(
        projectId,
        Number(latestBuild.id)
      )

      artifactNames = buildArtifacts.map(buildArtifact => buildArtifact.name)
    }

    console.log('Artifacts', artifactNames)

    for (let ix = 0; ix < artifactNames.length; ix++) {
      const name = artifactNames[ix]
      if (!name) {
        continue
      }

      // get artifact as zip
      const readableStream = await buildApi.getArtifactContentZip(
        projectId,
        Number(latestBuild.id),
        name
      )

      const artifactDirPath = `${targetDirectory}/${name}`

      // create artifact directory if not exists
      if (!fs.existsSync(artifactDirPath)) {
        fs.mkdirSync(artifactDirPath)
      }

      // store artifact
      const artifactFilePathStream = fs.createWriteStream(
        `${artifactDirPath}/${artifactName}.zip`
      )
      readableStream.pipe(artifactFilePathStream)
      readableStream.on('end', () => {
        console.log(`Artifact of build number ${latestBuild.buildNumber}
        downloaded at ${artifactDirPath}`)
      })
    }
  }
}
