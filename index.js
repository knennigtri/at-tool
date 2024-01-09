const targetRequests = require('./targetRequests.js');
const dataPreperation = require("./dataPreperation.js")
const path = require('path');
const OFFER_PATH = "params/offers"
const MODIFIEDAT = "2024-01-09"

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

    const environments = await dataPreperation.createAIOParams(null)
            const results = await Promise.all(environments.map(async (requestParams) => {
               const resultToken = await targetRequests.getAccessToken(requestParams)
                        console.log("Token captured for: " + requestParams.tenant);
                        switch (type) {
                            case cmd.create:
                                console.log("Request: " + type)
                                const offers = data;
                                return targetRequests.createOffers(requestParams, resultToken, offers)
                            case cmd.delete:
                                console.log("Request: " + type)
                                const modifiedAt = data;
                                console.log("Deleting offers with {modifiedAt: " + modifiedAt + "} for: " + requestParams.tenant)
                                return targetRequests.deleteOffers(requestParams, resultToken, modifiedAt);
                        }
            }));
            console.log("Final Results:");
            console.log(results);
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