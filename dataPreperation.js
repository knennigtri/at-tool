const debug = require("debug");
const debugJSON = debug("json");
const fs = require('fs');
const path = require('path');
const mkdirp = require('mkdirp');
const DEFAULT_AIO_DIR = "params/aio-projects";
const DEFAULT_OFFERS_DIR = "params/offers";
const OUTPUT_AXIOS = "bin/axios/";
const OUTPUT_OFFER = "bin/target/offers.json";

function getFiles(inputPath, reqExt, callback) {
  try {
    let jsonFiles = [];
    if (fs.statSync(inputPath).isDirectory()) {
      // Read the list of files in the folder synchronously
      let files = fs.readdirSync(inputPath);

      // Filter for JSON files
      jsonFiles = files
        .filter(file => path.extname(file).toLowerCase() === reqExt)
        .map(file => path.join(inputPath, file));
    } else if (fs.statSync(inputPath).isFile()) {
      if (path.extname(inputPath) == reqExt) jsonFiles.push(inputPath);
      debugJSON("Using single file: " + inputPath);
    }
    debugJSON("Merging:")
    debugJSON(jsonFiles)
    callback(null, jsonFiles);

  } catch (readDirErr) {
    console.error('Error reading the directory:', readDirErr);
    callback(readDirErr, null);
  }
}

function createTargetOffersObj(inputPath, callback) {
  if (!inputPath) {
    debugJSON("Using default folder: " + path.resolve(DEFAULT_OFFERS_DIR));
    inputPath = DEFAULT_OFFERS_DIR;
  }
  getFiles(inputPath, ".html", (err, files) => {
    if (err) {
      console.error('Error:', err);
      callback(err, null)
    }
    const contentArr = [];
    // Loop through the HTML files and read their content synchronously
    debugJSON(files)
    files.forEach(file => {
      try {
        console.log("Read HTML file: " + file);
        const data = fs.readFileSync(file, "utf-8");

        contentArr.push({
          "title": path.basename(file, path.extname(file)),
          "content": data.replace(/\n/g, "\\n")
            .replace(/\"/g, '\\"')
            .replace(/\\r/g, "\\r")
        });
      } catch (readFileErr) {
        console.error(`Error reading file ${file}:`, readFileErr);
      }
    });
    if (debugJSON.enabled) {
      writeObjectToFile(contentArr, OUTPUT_OFFER);
    }
    callback(null, contentArr);
  });
}

function createAIOParams(inputPath, callback) {
  if (!inputPath) {
    debugJSON("Using default folder: " + path.resolve(DEFAULT_AIO_DIR));
    inputPath = DEFAULT_AIO_DIR;
  }
  getFiles(inputPath, ".json", (err, files) => {
    if (err) {
      console.error('getFiles Error:', err);
      callback(err, null);
    }

    const contentArr = [];
    debugJSON(files)
    // Loop through the files and read their content synchronously
    files.forEach(file => {
      console.log(file)

      let data = {};
      try {
        data = fs.readFileSync(file, "utf8");
        data = JSON.parse(data);
      } catch (err) {
        console.log("requestJSON Error: " + err);
        callback(err, null)
      }

      console.log("Finding required request parameters from " + path.basename(file));
      let requestParams = {
        client_id: findNestedObj(data, "CLIENT_ID"),
        client_secret: findNestedObj(data, "CLIENT_SECRETS"),
        org_id: findNestedObj(data, "ORG_ID") || findNestedObj(data, "IMS_ORG_ID"),
        scope: findNestedObj(data, "SCOPES"),
        tenant: path.basename(file, path.extname(file))
      };

      debugJSON("Required Request Params:")
      debugJSON(requestParams);

      contentArr.push(requestParams);
    });
    if (debugJSON.enabled) {
      writeObjectToFile(contentArr, path.join(OUTPUT_AXIOS, "aio-projects.json"));
    }
    callback(null, contentArr);
  });
}

//Helper function to find the value of a nested key an a json object
function findNestedObj(entireObj, keyToFind) {
  let foundValue;
  JSON.stringify(entireObj, (curKey, curVal) => {
    if (curKey.toUpperCase().replace("-", "_").replace(" ", "_") == keyToFind) {
      // console.log("Found: " + keyToFind);
      foundValue = curVal;
    }
    return curVal;
  });
  return foundValue;
}

function writeObjectToFile(jsonObject, outputFile) {
  if (jsonObject) {
    const jsonString = JSON.stringify(jsonObject, null, 2);
    mkdirp.sync(path.dirname(outputFile));

    try {
      // Write the JSON string to the file synchronously
      fs.writeFileSync(outputFile, jsonString, 'utf8');
      debugJSON('Output has been written to', outputFile);
    } catch (err) {
      console.error('Error writing to the file:', err);
    }
  }
}

exports.createTargetOffersObj = createTargetOffersObj;
exports.createAIOParams = createAIOParams;