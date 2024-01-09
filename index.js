const targetRequests = require('./targetRequests.js');
const dataPreperation = require("./dataPreperation.js")
const MODIFIEDAT = "2024-01-09"

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
            console.log(JSON.stringify(results, null, 2));
};

let action = cmd.delete;
// let action = cmd.create;
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