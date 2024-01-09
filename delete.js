const atOffers = require("./targetOffers.js");
const pmEnv = require("./postmanEnvironment.js");
const newman = require("./newman.js");
const debug = require("debug");
const debugIndex = debug("index");

const AIO_FOLDER = "params/aio-projects";
const MODIFIED_AT = "2024-01-05";

const environments = pmEnv.convertAioJsons(AIO_FOLDER);

const runDeleteAsync = async (env, deleteTimestamp) => {
  return new Promise((resolve, reject) => {
    newman.deleteOffers(env, deleteTimestamp, (err, resultObj) => {
      if (err) {
        console.error(err);
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
      console.log("Deleting offers with timestamp '" + MODIFIED_AT + "' from: " + environment.name);
      try {
        await runDeleteAsync(environment, MODIFIED_AT);
      } catch (error) {
        console.error(error);
      }
    }
  })();
  