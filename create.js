const dataPreperation = require("./dataPreperation.js")
const debug = require("debug");
const debugIndex = debug("index");

// const offers = atOffers.createObject(OFFER_FOLDER);
// const environments = pmEnv.convertAioJsons(AIO_FOLDER);

// const runOffersAsync = async (env, htmlOffers) => {
//   return new Promise((resolve, reject) => {
//     newman.createOffers(env, htmlOffers, (err, resultObj) => {
//       if (err) {
//         console.error(err);
//         reject(err);
//       }
//       if (resultObj) {
//         console.log("Offers upload successful for " + env.name);
//         resolve(resultObj);
//       }
//     });
//   });
// };

function run(authParams, token, offersPath, callback) {
  dataPreperation.createTargetOffersObj(offersPath, (err, offers) => {
    if (err) {
      console.error('Error:', err);
      callback(err, null)
    }
    targetRequests.createOffers(authParams, token, offers);

    // dataPreperation.createAIOParams(aio_path, (err, environments) => {
    //   if (err) {
    //     console.error('Error:', err);
    //     callback(err, null)
    //   }
    //   (async () => {
    //     for (const requestParams of environments) {
    //       console.log("Posting Offers json to: " + requestParams.tenant);
    //       targetRequests.createOffers(requestParams, token, offers);
          
    //       // try {
    //       //   await runOffersAsync(environment, offers);
    //       // } catch (error) {
    //       //   // Handle errors if needed
    //       // }
    //     }
    //   })();
    // });
  });


}

exports.run = run;