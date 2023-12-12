const fs = require('fs');
const path = require('path');
const mkdirp = require('mkdirp');
const debug = require("debug");
const debugOffer = debug("offer");

const DEFAULT_INPUT_DIR = "offers";
const OUTPUT_DIR = "bin/target";

// createObject();

function createObject(inputFolder) {
  if(!inputFolder) {
    debugOffer("Using default folder: " + path.resolve(DEFAULT_INPUT_DIR));
    inputFolder = DEFAULT_INPUT_DIR;
  }

  const offers = []

  try {
    // Read the list of files in the folder synchronously
    const files = fs.readdirSync(inputFolder);

    // Filter for HTML files
    const htmlFiles = files.filter(file => path.extname(file).toLowerCase() === '.html');

    // Loop through the HTML files and read their content synchronously
    htmlFiles.forEach(file => {
      const filePath = path.join(inputFolder, file);

      try {
        console.log("Read HTML file: " + file);
        const data = fs.readFileSync(filePath, "utf-8");
        
        offers.push({
          "title": path.basename(file, path.extname(file)),
          "content": data.replace(/\n/g, "\\n")
            .replace(/\"/g, '\\"')
            .replace(/\\r/g, "\\r")
        });
      } catch (readFileErr) {
        console.error(`Error reading file ${file}:`, readFileErr);
      }
    });
  } catch (readDirErr) {
    console.error('Error reading the directory:', readDirErr);
  }
  if (debugOffer.enabled) {
    writeToFile(offers);
  }
  console.log("Offers JSON successfully created.");
  return offers;
}

function writeToFile(offers) {
  const fileName = 'offers.json';
  const filePath = path.join(OUTPUT_DIR, fileName);
  mkdirp.sync(OUTPUT_DIR);

  // Convert the array to a JSON string
  const jsonString = JSON.stringify(offers, null, 2); // The `null, 2` arguments format the JSON with indentation
  fs.writeFileSync(filePath, jsonString, 'utf-8');
  debugOffer(`Output written to ${filePath}`);
}

exports.createObject = createObject;