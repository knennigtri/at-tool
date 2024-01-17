const targetRequests = require("./targetRequests.js");
const dataPreperation = require("./dataPreperation.js");
const debug = require("debug");
const debugDryrun = debug("dryrun");
exports.debugOptions = Object.assign({
  "dryrun": "Run without API requests"
}, dataPreperation.debugOptions, targetRequests.debugOptions);

const mode = {
  create: "create",
  delete: "delete"
};

const runRequests = async (auth, type, data) => {
  try {
    const environments = await dataPreperation.createAIOParams(auth);
    const results = await Promise.all(environments.map(async (requestParams) => {
      try {
        const resultToken = await targetRequests.getAccessToken(requestParams);
        if (resultToken && !debugDryrun.enabled) {
          switch (type) {
            case mode.create:
              return targetRequests.createOffers(requestParams, resultToken, data);
            case mode.delete:
              console.log("Deleting offers with {modifiedAt: " + data + "} for: " + requestParams.tenant);
              return targetRequests.deleteOffers(requestParams, resultToken, data);
          }
        }
      } catch (error) {
        return { [requestParams.tenant]: error.response.data };
      }
    }));
    return JSON.stringify(results, null, 2);
  } catch (error) {
    return error;
  }
};

async function run(authPath, action, data) {
  try {
    switch (action) {
      case mode.create:
        console.log("Creating Offers object from: " + data);
        return dataPreperation.createTargetOffersObj(data)
          .then((offers) => {
            console.log("Offers prepared for upload.");
            return runRequests(authPath, mode.create, offers)
              .then((success) => "Results: " + success);
          });
      case mode.delete:
        return runRequests(authPath, mode.delete, data)
          .then((success) => "Results: " + success);
      default:
        return Promise.reject("Invalid action type");
    }
  } catch (error) {
    return Promise.reject(error);
  }
}

exports.run = run;
