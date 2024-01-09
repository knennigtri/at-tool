const targetRequests = require('./targetRequests.js');
const dataPreperation = require("./dataPreperation.js")
const createOffers = require("./create.js");
const path = require('path');
const { callbackify } = require('util');
const OFFER_PATH = "params/offers"
const AIO_FILE = "./params/aio-projects/vlab7-us.json"
const MODIFIEDAT = "2024-01-05"
let AIO_JSON = require(AIO_FILE);

let OAUTH = AIO_JSON.project.workspace.details.credentials[0].oauth_server_to_server
const AUTH_JSON = {
    client_id: OAUTH.client_id,
    client_secret: OAUTH.client_secrets.join(","),
    scope: OAUTH.scopes.join(","),
    org_id: AIO_JSON.project.org.ims_org_id,
    tenant: path.parse(AIO_FILE).name
}

let action = 'create';

// orgParams.getFiles(AIO_FILE);

// return;
dataPreperation.createAIOParams(null, (err, environments) => {
    if (err) {
        console.error('Error:', err);
        // callback(err, null)
        return;
    }
    for (const requestParams of environments) {
        console.log("Running API Requests on: " + requestParams.tenant);

        // let token = "";
        targetRequests.getAccessToken(requestParams)
            .then((err, aToken) => {
                if (err) {
                    console.error('Offer Error:', err);
                    callback(err, null)
                } 
                callback(null, aToken);
                // token = aToken;
            }).then((err, aToken) => {
                if (err) {
                    console.error('Offer Error:', err);
                    callback(err, null)
                    } 
                switch (action) {
                    case 'create':
                        dataPreperation.createTargetOffersObj(null, (err, offers) => {
                            if (err) {
                              console.error('Offer Error:', err);
                              callback(err, null)
                            }
                        })
                        .then(() =>{
                            console.log(aToken)
                            // targetRequests.createOffers(requestParams, aToken, offers);
                        })
                            



                        // createOffers.run(null, null, token, (err, success) => {
                        //     if (err) {
                        //         console.error('getFiles Error:', err);
                        //         return;
                        //     } else {
                        //         console.log("success");
                        //     }
                        // });

                        break;
                    case 'delete':
                        targetRequests.deleteOffers(AUTH_JSON, token, MODIFIEDAT);
                        break;
                }
            }).catch(error => {
                console.log(error);
            });
    }
});