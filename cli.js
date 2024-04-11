const packageInfo = require("./package.json");
const atTool = require("./index.js");
const minimist = require("minimist");
const args = minimist(process.argv.slice(2));

//Mac: DEBUG=* aep-tag-tool....
//WIN: set DEBUG=* & aep-tag-tool....
const debug = require("debug");
const debugArgs = debug("args");
const debbugOptions = {
  ...{
    "*": "Output all debugging messages",
    "args": "See CLI argument messages"
  },
  ...atTool.debugOptions
};

//Vision
// at-tool  offers:delete 2023-01 -A params/aio-projects 
// at-tool  offers:create path/to/offers -A params/aio-projects 
// at-tool  audiences:create path/to/file.json -A params/aio-projects 


exports.run = function () {
  let argsAuthPath = args.auth || args.A;
  let argsCreate = args.create || args.C;
  let argsDelete = args.delete || args.D;
  const origMode = argsCreate ? modes.create : argsDelete ? modes.delete : "";

  debugArgs(JSON.stringify(args, null, 2));
  debugArgs(args._[0])

  const argsVersion = args.v || args.version;
  const argsHelp = args.h || args.help;
  const argsDebug = args.d || args.debug;

  // Show CLI help
  if (argsHelp) {
    let helpType = argsHelp === true ? "default" : argsHelp.toLowerCase();
    if (HELP[helpType]) console.log(HELP[helpType]);
    else console.log(HELP.default);
    return;
  }

  // Show version
  if (argsVersion) {
    console.log(packageInfo.version);
    return;
  }

  if (argsDebug) {
    console.log("[Mac] $ DEBUG:<option> " + cliName + " -m <file>");
    console.log("[Win] $ set DEBUG=<option> & " + cliName + " -m <file>");
    console.log("Options: " + JSON.stringify(debbugOptions, null, 2));
    return;
  }

  //Validate  that an auth folder/file was given
  if (!argsAuthPath || typeof argsAuthPath == "boolean") {
    console.log("No authentication json given");
    console.log(HELP.auth);
    return;
  }

  //Validate there was input for TYPE and MODE
  if (args._.length === 0) {
    console.log("You must specify a TYPE:MODE");
    console.log(useage);
    return;
  }
  const cmd = args._[0].split(":");
  if (cmd.length > 2) console.log("Ignoring any commands beyond TYPE:MODE in " + args._[0])
  const type = cmd[0];
  const mode = cmd[1];

  //Check if both TYPE and MODE exist
  if (!mode || !type) {
    console.log("The command: " + args._[0] + " is note a valid TYPE:MODE");
    console.log(useage);
    return;
  }
  //Check that TYPE is valid
  if ((type.toLowerCase() != atTool.TYPES.offers) && (type.toLowerCase() != atTool.TYPES.audiences)) {
    console.log("The command: " + args._[0] + " does not have a valid TYPE");
    console.log(useage);
    return;
  }
  //Check that MODE is valid
  if ((mode.toLowerCase() != atTool.MODES.create) && (mode.toLowerCase() != atTool.MODES.delete)) {
    console.log("The command: " + args._[0] + " does not have a valid MODE");
    console.log(useage);
    return;
  }
  //Check that DATA was given
  if (args._.length != 2) {
    console.log("The command: " + args._[0] + " must have DATA.");
    console.log(useage);
    return;
  }

  if (type.toLowerCase() == atTool.TYPES.audiences) {
    console.log(HELP.audiences);
    return;
  } else if (type.toLowerCase() == atTool.TYPES.offers) {
    atTool.run(argsAuthPath, mode, data)
      .then((success) => {
        console.log(success);
      })
      .catch((error) => {
        console.error(error);
        console.log(HELP.default);
      })
  }
};

const cliName = packageInfo.name.replace("@knennigtri/", "");
const param_auth = "-A, --auth <auth.json>      AIO project json or oAuth json";
const useage =
  `Usage: 

 $ ${cliName} TYPE:MODE DATA

  TYPE: offers | audiences
  MODE: create | delete
`;
const HELP = {
  default:
    `${useage}
Required:
  ${param_auth}

Options:
  -v, --version               Displays version of this package
  -h, --help
  -d, --debug                 See debug Options

Optionally use: ${cliName} -h auth|offers|audiences
    `,
  auth:
    `In your Adobe IO Project under Credentials click the "Download JSON" button
    For OAuth credentials, make sure the JSON contains at least:
    {
    "ORG_ID": "xxxxxxxxxxxxxxxxxxxxx@AdobeOrg",
    "CLIENT_SECRETS": [ "xxxxxxxxxxxxxxxxxxxxx" ],
    "CLIENT_ID": "xxxxxxxxxxxxxxxxxxxxx",
    "SCOPES": [
      "xxxxxxxxx",
      "xxxxxxxxx",
      "xxxxxxxxx"
    ]
  }`,
  offers:
    `USAGE:
  $ ${cliName} offers:create PATH     Uploads all offers found at PATH

   PATH can be a folder or single html file

USAGE:
  $ ${cliName} offers:delete STRING     Deletes all offers modifiedAt containing STRING  

   STRING to be searched in the modifiedAt property. Ex: 2024-01-12T18:51:01Z

REQUIRED:
  ${param_auth}
  `,
  audiences: "audiences TYPE is not implemented yet.",
};


const aud =
  `USAGE:
  $ ${cliName} audiences:create PATH

ARGUMENTS:
  PATH: the path to athe json with the audiences to create

USAGE:
  $ ${cliName} audiences:delete STRING     Deletes all audiences modifiedAt containing <String>  

ARGUMENTS:
  STRING:  string to be searched in the modifiedAt property of the audiences to delete. Ex: 2024-01-12T18:51:01Z

REQUIRED:
  ${param_auth}`