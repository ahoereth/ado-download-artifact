"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const azdev = __importStar(require("azure-devops-node-api"));
class ArtifactDownloader {
    constructor() { }
    download(projectId, buildDefinitionId, patToken, orgName, artifactName, branchName, commit) {
        return __awaiter(this, void 0, void 0, function* () {
            // base tfs url
            const baseTfsUrl = 'https://dev.azure.com';
            const orgUrl = `${baseTfsUrl}/${orgName}`;
            // get auth handler
            let authHandler = azdev.getPersonalAccessTokenHandler(patToken);
            // get the connection to webapi
            let connection = new azdev.WebApi(orgUrl, authHandler);
            const buildApi = yield connection.getBuildApi();
            // get top build for a particular definitions
            console.log(branchName);
            let builds = yield buildApi.getBuilds(projectId, // projectId
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
            branchName || undefined, // branchName
            undefined, // buildIds
            undefined, // repositoryId
            undefined // repositoryType
            );
            if (commit) {
                builds = builds.filter(build => {
                    console.log(build.sourceVersion);
                    return build.sourceVersion == commit;
                });
            }
            const latestBuild = builds[0];
            console.log(latestBuild);
            // // get artifact as zip
            // const readableStream = await buildApi.getArtifactContentZip(projectId,
            // Number(latestBuild.id), artifactName); const artifactDirPath =
            // `${process.env.GITHUB_WORKSPACE}/${artifactName}`
            // // create artifact directory if not exists
            // if (!fs.existsSync(artifactDirPath)) {
            //     fs.mkdirSync(artifactDirPath);
            // }
            // // store artifact
            // const artifactFilePathStream =
            // fs.createWriteStream(`${artifactDirPath}/${artifactName}.zip`);
            // readableStream.pipe(artifactFilePathStream);
            // readableStream.on('end',()=>{
            //     console.log(`Artifact of build number ${latestBuild.buildNumber}
            //     downloaded at ${artifactDirPath}`);
            // });
        });
    }
}
exports.ArtifactDownloader = ArtifactDownloader;
