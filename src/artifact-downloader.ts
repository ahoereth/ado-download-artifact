import * as azdev from 'azure-devops-node-api'
import * as fs from 'fs'
// import extract from 'extract-zip'

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
    const buildId = Number(latestBuild.id)
    console.log('Found build', latestBuild)

    targetDirectory = `${process.env.GITHUB_WORKSPACE}/${targetDirectory}`
    if (!fs.existsSync(targetDirectory)) {
      fs.mkdirSync(targetDirectory)
    }

    let artifactNames: (string | undefined)[] = [artifactName]

    if (!artifactName) {
      const buildArtifacts = await buildApi.getArtifacts(projectId, buildId)
      console.log(buildArtifacts)
      artifactNames = buildArtifacts.map(buildArtifact => buildArtifact.name)
    }

    console.log('Artifacts', artifactNames)

    const promises: Promise<void>[] = []

    for (let ix = 0; ix < artifactNames.length; ix++) {
      const name = artifactNames[ix]
      if (!name) {
        continue
      }

      // get and store artifact as zip
      const readableStream = await buildApi.getArtifactContentZip(
        projectId,
        buildId,
        name
      )
      const unzipPath = `${targetDirectory}/${name}`
      const zipPath = `${unzipPath}.zip`
      const artifactFilePathStream = fs.createWriteStream(zipPath)
      readableStream.pipe(artifactFilePathStream)

      promises.push(
        new Promise((resolve, reject) => {
          readableStream.on('end', () => {
            console.log(`Artifact downloaded: ${zipPath}`)
            // fs.createReadStream(zipPath).pipe(unzip.Extract({path: unzipPath}))
            // extract(zipPath, {dir: unzipPath}).then(resolve)
            // console.log(`Artifact unpacked: ${unzipPath}`)
            resolve()
          })
        })
      )
    }

    await Promise.all(promises)
  }
}
