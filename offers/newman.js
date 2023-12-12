const newman = require("newman");
const fs = require("fs");
//https://www.npmjs.com/package/debug
//Mac: DEBUG=* node...
//WIN: set DEBUG=* & node...
const debug = require("debug");
const debugNewman = debug("newman");
require("debug")("newman:cli");
exports.debugOptions = {
  "collections": "Postman collection messages",
  "newman": "Newman command messages",
  "newman:cli": "Newman cli output for verbose messaging of collections"
};

let REPORTERS = ["emojitrain", "junit"];
const IO_OAUTH_COLLECTION = require("./postman/Adobe IO Token OAuth.postman_collection.json");
const TARGET_OFFERS_COLLECTION = require("./postman/Create Offers.postman_collection.json");
const DELETE_OFFERS_COLLECTION = require("./postman/Delete Offers.postman_collection.json");

if (debug.enabled("newman:cli")) {
  REPORTERS = ["cli", "junit"];
}

let TIMESTAMP = formatDateTime();
let reportersDir = "bin/newman/";

function createOffers(env, offerData, callback) {
  authenicateAIO(env)
    .then((resultEnv) => newmanRun(
      "createOffers",
      resultEnv,
      "",
      TARGET_OFFERS_COLLECTION,
      "",
      offerData,
      ""
    )
      .then((resultEnv) => callback(null, resultEnv))
      .catch(err => callback(err, null)));
}

function deleteOffers(env, modifiedAt, callback){
  authenicateAIO(env)
    .then((resultEnv) => newmanRun(
      "deleteOffers",
      resultEnv,
      "",
      DELETE_OFFERS_COLLECTION,
      "",
      "",
      [{
        "key": "offesrModifiedAt",
        "value": modifiedAt
      }]
    )
      .then((resultEnv) => callback(null, resultEnv))
      .catch(err => callback(err, null)));
}

// Runs the Adobe IO Token collection
function authenicateAIO(environment) {
  return newmanRun("auth",
    environment, "",
    IO_OAUTH_COLLECTION, "",
    "", "");
}

function newmanRun(cmdName, env, globals, collection, folder, data, envVar) {
  debugNewman(JSON.stringify(data, null, 2));

  const reportName = TIMESTAMP + "-" + cmdName + "-Report";
  if (folder && folder != "") {
    console.log("Running: " + folder + " for: " + cmdName);
  } else {
    console.log("Running: " + cmdName + " for " + env.name);
  }

  debugNewman("ReportNameHTML: " + reportersDir + reportName + ".[html | xml]");
  return new Promise(function (resolve, reject) {
    //run newman to create new rule
    newman.run({
      collection: collection,
      environment: env,
      globals: globals,
      folder: folder,
      envVar: envVar,
      iterationData: data,
      reporters: REPORTERS,
      reporter: {
        "junit": { export: reportersDir + reportName + ".xml" }
      }//TODO investigate saving via Win and Mac
    }).on("done", function (err, summary) {
      if (err) reject(err);

      if (summary.run.failures != "") {
        reject("API Failures. Check the report logs in " + reportersDir);
      }
      resolve(summary.environment);
    });
  });
}
function formatDateTime() {
  var d = new Date(Date.now());
  var year = d.getFullYear();
  var month = d.getMonth() + 1;
  var date = d.getDate();
  var hour = d.getHours();
  var min = (d.getMinutes() < 10 ? "0" : "") + d.getMinutes();
  var time = year + "-" + month + "-" + date + "-" + hour + ":" + min;
  return time;
}

exports.createOffers = createOffers;
exports.deleteOffers = deleteOffers;