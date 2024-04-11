const targetRequests = require("./targetRequests.js");
const dataPreperation = require("./dataPreperation.js");
const debug = require("debug");
const debugDryrun = debug("dryrun");
exports.debugOptions = Object.assign({
  "dryrun": "Run without API requests"
}, dataPreperation.debugOptions, targetRequests.debugOptions);

const MODES = {
  create: "create",
  delete: "delete"
};
const TYPES = {
  offers: "offers",
  audiences: "audiences"
};

//TODO implement audiences
const runRequests = async (auth, mode, data) => {
  try {
    const environments = await dataPreperation.createAIOParams(auth);
    const results = await Promise.all(environments.map(async (requestParams) => {
      try {
        const resultToken = await targetRequests.getAccessToken(requestParams);
        if (resultToken && !debugDryrun.enabled) {
          switch (mode) {
            case MODES.create:
              return targetRequests.createOffers(requestParams, resultToken, data);
            case MODES.delete:
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

async function run(authPath, mode, data) {
  try {
    switch (mode) {
      case MODES.create:
        console.log("Creating Offers object from: " + data);
        return dataPreperation.createTargetOffersObj(data)
          .then((offers) => {
            console.log("Offers prepared for upload.");
            return runRequests(authPath, MODES.create, offers)
              .then((success) => "Results: " + success);
          });
      case MODES.delete:
        return runRequests(authPath, MODES.delete, data)
          .then((success) => "Results: " + success);
      default:
        return Promise.reject("Invalid action type");
    }
  } catch (error) {
    return Promise.reject(error);
  }
}

exports.run = run;
exports.TYPES = TYPES;
exports.MODES = MODES;
