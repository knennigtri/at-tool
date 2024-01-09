const targetRequests = require('./targetRequests.js');
const dataPreperation = require("./dataPreperation.js")
const path = require('path');
const OFFER_PATH = "params/offers"
const MODIFIEDAT = "2024-01-05"

// const AIO_FILE = "./params/aio-projects/vlab7-us.json"
// let AIO_JSON = require(AIO_FILE);

// let OAUTH = AIO_JSON.project.workspace.details.credentials[0].oauth_server_to_server
// const AUTH_JSON = {
//     client_id: OAUTH.client_id,
//     client_secret: OAUTH.client_secrets.join(","),
//     scope: OAUTH.scopes.join(","),
//     org_id: AIO_JSON.project.org.ims_org_id,
//     tenant: path.parse(AIO_FILE).name
// }

const cmd = {
    create: "create",
    delete: "delete"
};

const runRequests = async (type, data) => {
    try{
    const environments = await dataPreperation.createAIOParams(null);
    // dataPreperation.createAIOParams(null)
    //     .then(environments => {
    //         // next = false;
    console.log(environments.length);
            for (const requestParams of environments) {
                console.log("--Running Requests for " + requestParams.tenant + "--")
                // break;
                const resultToken = await targetRequests.getAccessToken(requestParams)
                    // .then((resultToken) => {
                        
                        console.log("Token captured for: " + requestParams.tenant);
                        // if(type == cmd.create){
                        //     console.log("Request: " + type)
                        //     await targetRequests.createOffers(requestParams, resultToken, data)
                        // } else if(type == cmd.delete){
                        //     console.log("Request: " + type)
                        //     console.log("Deleting offers with {modifiedAt: " + data + "} for: " + requestParams.tenant)
                        //     // await targetRequests.deleteOffers(requestParams, resultToken, data);
                        // } else {
                        //     console.log("no command specified")
                        // }
                        switch (type) {
                            case cmd.create:
                                console.log("Request: " + type)
                                const offers = data;
                                await targetRequests.createOffers(requestParams, resultToken, offers)
                                break;
                            case cmd.delete:
                                console.log("Request: " + type)
                                const modifiedAt = data;
                                console.log("Deleting offers with {modifiedAt: " + modifiedAt + "} for: " + requestParams.tenant)
                                await targetRequests.deleteOffers(requestParams, resultToken, modifiedAt);
                                break;
                        }
                    // }).catch((error) => {
                    //     console.log(error);
                    // });
                // });
            }
        // })
        } catch (err) {
            console.error(err);
        }
};

let action = cmd.delete;
switch (action) {
    case cmd.create:
        console.log("Offers data not created, creating...")
        dataPreperation.createTargetOffersObj(null)
            .then((offers) => {
                console.log("Offers prepared for upload.");
                runRequests('create', offers)
                .then(() => {
                    console.log('Requests completed successfully');
                })
                .catch((error) => {
                    console.error('Error running requests:', error);
                });
            })
            .catch((err) => {
                console.error(err);
            });
        break;
    case cmd.delete:
        runRequests('delete', MODIFIEDAT);
        break;
}