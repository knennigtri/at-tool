const targetRequests = require("./targetRequests.js");
const dataPreperation = require("./dataPreperation.js");
const MODIFIEDAT = "2024-01-09";

const mode = {
  create: "create",
  delete: "delete"
};

const runRequests = async (type, data) => {
  const environments = await dataPreperation.createAIOParams(null);
  const results = await Promise.all(environments.map(async (requestParams) => {
    const resultToken = await targetRequests.getAccessToken(requestParams);
    console.log("Token captured for: " + requestParams.tenant);
    switch (type) {
    case mode.create:
      console.log("Request: " + type);
      return targetRequests.createOffers(requestParams, resultToken, data);
    case mode.delete:
      console.log("Request: " + type);
      console.log("Deleting offers with {modifiedAt: " + data + "} for: " + requestParams.tenant);
      return targetRequests.deleteOffers(requestParams, resultToken, data);
    }
  }));
  console.log("Final Results:");
  console.log(JSON.stringify(results, null, 2));
};

let action = mode.delete;
// let action = cmd.create;
switch (action) {
case mode.create:
  console.log("Offers data not created, creating...");
  dataPreperation.createTargetOffersObj(null)
    .then((offers) => {
      console.log("Offers prepared for upload.");
      runRequests(mode.create, offers)
        .then(() => {
          console.log("Requests completed successfully");
        })
        .catch((error) => {
          console.error("Error running requests:", error);
        });
    })
    .catch((err) => {
      console.error(err);
    });
  break;
case mode.delete:
  runRequests(mode.delete, MODIFIEDAT);
  break;
}
