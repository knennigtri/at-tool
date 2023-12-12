const debug = require("debug");
const debugPM = debug("pm");
const fs = require('fs');
const path = require('path');
const mkdirp = require('mkdirp');
const POSTMAN_ENV = require("./postman/template.postman_environment.json");
const DEFAULT_INPUT_DIR = "../aio-projects";
const OUTPUT_DIR = "bin/postman/environments/";

// applyAioJsons();

function convertAioJsons(inputPath) {
  if (!inputPath) {
    debugPM("Using default folder: " + path.resolve(DEFAULT_INPUT_DIR));
    inputPath = DEFAULT_INPUT_DIR;
  }
  let environmentArr = [];
  try {
    if (fs.statSync(inputPath).isFile() && path.extname(inputPath) == ".json") {
      let environment = inputToPMEnv(inputPath);
      if (debugPM.enabled) {
        const outputFile = path.basename(inputPath, path.extname(inputPath)) + ".postman_environment.json";
        writePostmanEnvironmentFile(environment, path.join(OUTPUT_DIR, outputFile));
      }
      console.log(path.basename(inputPath, path.extname(inputPath)) + " Postman Environment created.");
      environmentArr.push(environment);
    } else { // is folder
      // Read the list of files in the folder synchronously
      const files = fs.readdirSync(inputPath);

      // Filter for JSON files
      const jsonFiles = files.filter(file => path.extname(file).toLowerCase() === '.json');

      // Loop through the files and read their content synchronously
      jsonFiles.forEach(jsonFile => {
        const jsonFilePath = path.join(inputPath, jsonFile);
        //apply input file to a postman environmnet json template
        let environment = inputToPMEnv(jsonFilePath)

        if (debugPM.enabled) {
          const outputFile = path.basename(jsonFile, path.extname(jsonFile)) + ".postman_environment.json";
          writePostmanEnvironmentFile(environment, path.join(OUTPUT_DIR, outputFile));
        }
        console.log(path.basename(jsonFile, path.extname(jsonFile)) + " Postman Environment created.");
        environmentArr.push(environment);
      });
    }
  } catch (readDirErr) {
    console.error('Error reading the directory:', readDirErr);
  }
  return environmentArr;
}

// Applies an input file to a postman environmnet json template
// Returns an updated postman environment json
function inputToPMEnv(file) {
  let data = getJsonInFile(file);
  let fileName = path.basename(file, path.extname(file));
  if (!data) return;

  let postmanObj = POSTMAN_ENV;
  let authParamCount = 0; // counter to make sure all auth params are set

  console.log("Applying " + path.basename(file) + " to a postman environment file...");
  let foundValues = {};
  //Gather all required values from the input file
  foundValues.CLIENT_ID = findNestedObj(data, "CLIENT_ID");
  foundValues.CLIENT_SECRETS = findNestedObj(data, "CLIENT_SECRETS");
  foundValues.ORG_ID = findNestedObj(data, "ORG_ID") || findNestedObj(data, "IMS_ORG_ID");
  foundValues.SCOPES = findNestedObj(data, "SCOPES");
  foundValues.tenant = fileName;

  //Apply found values to the postman environment template
  for (let key in foundValues) {
    if (foundValues[key]) {
      let foundValue = foundValues[key];
      postmanObj = setEnvValue(postmanObj, key, foundValue);
      debugPM(key + " set");
      authParamCount++;
    } else console.error("Could not find " + key);
  }
  //Verify that all 5 foundValues above are set
  if (authParamCount == 5) {
    postmanObj.name = fileName;
    return postmanObj;
  } else {
    console.log("Input values missing, Postman Environment object not created.")
  }
}

function getJsonInFile(file) {
  let data = {};
  if (typeof file == "string") {
    if (fs.lstatSync(file).isFile()) {
      file = path.resolve(file);
      data = fs.readFileSync(file, "utf8");;
    } else {
      data = file;
    }
  } else {
    data = "{}";
  }
  try {
    //Attempt to read JSON
    return JSON.parse(data);
  } catch (err) {
    new Error("File does not contain valid JSON content.", { cause: err.name });
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

//Helper method update (or add) a key/value pair to a Postman Environment JSON
function setEnvValue(envObj, key, value) {
  envObj = JSON.parse(JSON.stringify(envObj));
  let addVal = true;
  let envVal = {};
  if (envObj && envObj.values) {
    for (let i = 0; i < envObj.values.length; i++) {
      envVal = envObj.values[i];
      if (envVal.key == key) {
        addVal = false;
        envVal.value = value;
        envObj.values[i] = envVal;
        i = envObj.values.length;
      }
    }
    if (addVal) {
      envVal = {
        "type": "any",
        "value": value,
        "key": key
      };
      envObj.values.push(envVal);
    }
    return envObj;
  }
  return null;
}

function writePostmanEnvironmentFile(jsonObject, outputFile) {
  if (jsonObject) {
    const jsonString = JSON.stringify(jsonObject, null, 2);
    mkdirp.sync(path.dirname(outputFile));

    try {
      // Write the JSON string to the file synchronously
      fs.writeFileSync(outputFile, jsonString, 'utf8');
      debugPM('Output has been written to', outputFile);
    } catch (err) {
      console.error('Error writing to the file:', err);
    }
  }
}

exports.convertAioJsons = convertAioJsons;