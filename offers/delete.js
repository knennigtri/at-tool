const atOffers = require("./targetOffers.js");
const pmEnv = require("./postmanEnvironment.js");
const newman = require("./newman.js");
const debug = require("debug");
const debugIndex = debug("index");

const envFile = "../aio-projects/vlab7-us.json";
const deleteOffersModifiedAt = "2023-11-17";

const environments = pmEnv.convertAioJsons(envFile);

const runDeleteAsync = async (env, deleteTimestamp) => {
  return new Promise((resolve, reject) => {
    newman.deleteOffers(env, deleteTimestamp, (err, resultObj) => {
      if (err) {
        console.error(err);
        console.log(message.HELP);
        reject(err);
      }
      if (resultObj) {
        console.log("All offers with a timestamp containing '" + deleteTimestamp + "' are deleted for " + env.name);
        resolve(resultObj);
      }
    });
  });
};

(async () => {
    for (const environment of environments) {
      console.log("Deleting offers with timestamp '" + deleteOffersModifiedAt + "' from: " + environment.name);
      try {
        await runDeleteAsync(environment, deleteOffersModifiedAt);
      } catch (error) {
        console.error(error);
      }
    }
  })();
  