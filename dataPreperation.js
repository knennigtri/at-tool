const debug = require("debug");
const debugJSON = debug("json");
const fs = require("fs");
const { readdir, stat } = fs.promises;
const path = require("path");
const mkdirp = require("mkdirp");
const OUTPUT_AXIOS = "target/axios/";
const OUTPUT_OFFER = "target/target/offers.json";
exports.debugOptions = {
  "json": "Validate json objects with written files under ./target/*"
};

async function getFiles(inputPath, reqExt) {
  try {
    let jsonFiles = [];

    const fileStat = await stat(inputPath);

    if (fileStat.isDirectory()) {
      // Read the list of files in the folder asynchronously
      const files = await readdir(inputPath);

      // Filter for JSON files
      jsonFiles = files
        .filter(file => path.extname(file).toLowerCase() === reqExt)
        .map(file => path.join(inputPath, file));
    } else if (fileStat.isFile() && path.extname(inputPath) == reqExt) {
      jsonFiles.push(inputPath);
      debugJSON("Using single file: " + inputPath);
    }

    debugJSON("Merging:");
    debugJSON(jsonFiles);
    
    return jsonFiles;
  } catch (error) {
    throw error;
  }
}

async function createTargetOffersObj(inputPath) {
  try {
    const files = await getFiles(inputPath, ".html");

    //Make sure at least 1 file was found
    if (!files || files.length === 0) {
      throw new Error("No html offer files found at: " + inputPath);
    }

    // Loop through the HTML files and read their content synchronously
    const contentArr = [];
    for (const file of files) {
      try {
        console.log("Reading: " + file);
        const data = fs.readFileSync(file, "utf-8");

        contentArr.push({
          "title": path.basename(file, path.extname(file)),
          "content": data.replace(/\n/g, "\\n")
            .replace(/\"/g, "\\\"")
            .replace(/\\r/g, "\\r")
        });
      } catch (readFileErr) {
        console.error(`Error reading file ${file}:`, readFileErr);
        throw readFileErr;
      }
    }

    if (debugJSON.enabled) {
      writeObjectToFile(contentArr, OUTPUT_OFFER);
    }

    return contentArr;
  } catch (error) {
    console.error("An error occurred:", error);
    throw error;
  }
}

async function createAIOParams(inputPath) {
  try {
    const files = await getFiles(inputPath, ".json");

    //Make sure at least 1 file was found
    if (!files || files.length === 0) {
      throw new Error("No aio json files found at: " + inputPath);
    }

    // Loop through the JSON files and read their content synchronously
    const contentArr = [];
    for (const file of files) {
      debugJSON(file);

      let data = {};
      try {
        data = fs.readFileSync(file, "utf8");
        data = JSON.parse(data);
      } catch (err) {
        console.log("requestJSON Error: " + err);
        throw err;
      }

      console.log("Finding required request parameters from " + file);
      let requestParams = {}
      let value = findNestedObj(data, "CLIENT_ID")
      if(value) requestParams.client_id = value;
      else console.error("client_id missing");

      value = findNestedObj(data, "CLIENT_SECRETS")
      if(value) requestParams.client_secret = value;
      else console.error("client_secret missing");

      value = findNestedObj(data, "ORG_ID") || findNestedObj(data, "IMS_ORG_ID");
      if(value) requestParams.org_id = value;
      else console.error("org_id missing");

      value = findNestedObj(data, "SCOPES");
      if(value) requestParams.scope = value;
      else console.error("scope missing");

      value = path.basename(file, path.extname(file));
      if(value) requestParams.tenant = value;
      else console.error("tenant missing");

      debugJSON(requestParams);
      contentArr.push(requestParams);
    }

    if (debugJSON.enabled) {
      writeObjectToFile(contentArr, path.join(OUTPUT_AXIOS, "aio-projects.json"));
    }

    return contentArr;
  } catch (error) {
    console.error("An error occurred:", error);
    throw error;
  }
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
      fs.writeFileSync(outputFile, jsonString, "utf8");
      debugJSON("Output has been written to", outputFile);
    } catch (err) {
      console.error("Error writing to the file:", err);
    }
  }
}

exports.createTargetOffersObj = createTargetOffersObj;
exports.createAIOParams = createAIOParams;