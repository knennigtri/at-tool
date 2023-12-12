const atOffers = require("./targetOffers.js");
const pmEnv = require("./postmanEnvironment.js");
const newman = require("./newman.js");
const debug = require("debug");
const debugIndex = debug("index");

const offers = atOffers.createObject();
const environments = pmEnv.convertAioJsons();

const runOffersAsync = async (env, htmlOffers) => {
  return new Promise((resolve, reject) => {
    newman.createOffers(env, htmlOffers, (err, resultObj) => {
      if (err) {
        console.error(err);
        console.log(message.HELP);
        reject(err);
      }
      if (resultObj) {
        console.log("Offers upload successful for " + env.name);
        resolve(resultObj);
      }
    });
  });
};

(async () => {
  for (const environment of environments) {
    console.log("Posting Offers json to: " + environment.name);
    try {
      await runOffersAsync(environment, offers);
    } catch (error) {
      // Handle errors if needed
    }
  }
})();