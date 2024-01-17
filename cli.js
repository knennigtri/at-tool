const packageInfo = require("./package.json");
const atTool = require("./index.js");
const minimist = require("minimist");
const args = minimist(process.argv.slice(2));
//Mac: DEBUG=* aep-tag-tool....
//WIN: set DEBUG=* & aep-tag-tool....
const debug = require("debug");
const debugArgs = debug("args");
const debbugOptions = Object.assign({
  "*": "Output all debugging messages",
  "args": "See CLI argument messages"
}, atTool.debugOptions); 

const modes = {
  create: "create",
  delete: "delete"
};

exports.run = function () {
  let argsAuthPath = args.auth || args.A;
  let argsCreate = args.create || args.C;
  let argsDelete = args.delete || args.D;
  const mode = argsCreate ? modes.create : argsDelete ? modes.delete : "";

  debugArgs(JSON.stringify(args, null, 2));

  const argsVersion = args.v || args.version;
  const argsHelp = args.h || args.help;

  // Show CLI help
  if (argsHelp) {
    const helpType = argsHelp === true ? "default" : argsHelp.toLowerCase();
    console.log(HELP[helpType]);
    return;
  }

  // Show version
  if (argsVersion) {
    console.log(packageInfo.version);
    return;
  }

  //Validate  that an auth folder/file was given
  if (!argsAuthPath || typeof argsAuthPath == "boolean") {
    console.log("No authentication json given");
    console.log(HELP_AUTH);
    return;
  }

  //Validate that exactly 1 mode was given
  if (!mode || (argsCreate && argsDelete)) {
    console.log("You must select a single mode");
    console.log(HELP);
    return;
  }

  //Validate that data was given with the mode
  let data = "";
  if (argsCreate) {
    if (typeof argsCreate == "boolean") {
      console.log("Create mode must have a file/folder input parameter");
      console.log(HELP);
      return;
    } else {
      data = argsCreate;
    }
  }
  if (argsDelete) {
    if (typeof argsDelete == "boolean") {
      console.log("Delete Offers mode must have an input filter term");
      console.log(HELP);
      return;
    } else {
      data = argsDelete;
    }
  }

  console.log("Running in " + mode.toUpperCase() + " mode");
  atTool.run(argsAuthPath, mode, data)
  .then((success) => {
    console.log(success);
  })
  .catch((error) => {
    console.error(error);
    console.log(HELP);
  })
};

const cliName = packageInfo.name.replace("@knennigtri/", "");
const HELP = {
  default:
    `Usage: ${cliName} [ARGS]
 Arguments:
    -A, --auth <auth.json>      AIO project json or oAuth json
    -D, --delete <String>       [Mode] Deletes all offers modifiedAt containing <String>              
    -C, --create <path>         [Mode] Creates offer(s) at the given path
    -v, --version               Displays version of this package
    -h, --help

    Optionally use: ${cliName} -h auth|create|delete|debug
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
  create: "My Create message",
  delete: "My Delete Message",
  debug: 
  `Debug options:
  Mac:
    $ DEBUG=<value> ${cliName}....
  Win:
    $ set DEBUG=<value> & ${cliName}...

  Where <value> can be:
`
  + JSON.stringify(debbugOptions, null, 2)
    .replaceAll("\": ","     ")
    .replaceAll("\"","")
    .replaceAll(",","")
    .replaceAll("{\n","")
    .replaceAll("}","")
};
