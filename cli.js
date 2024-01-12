const packageInfo = require("./package.json");
const minimist = require("minimist");
const args = minimist(process.argv.slice(2));
//https://www.npmjs.com/package/debug
//Mac: DEBUG=* aep-tag-tool....
//WIN: set DEBUG=* & aep-tag-tool....
const debug = require("debug");
const debugDryRun = debug("dryrun");
const debugArgs = debug("args");
exports.debugOptions = {
  "*": "Output all debugging messages",
  "dryrun": "Run without running postman collections to verify input",
  "args": "See CLI argument messages"
};

exports.mode = {
    create: "create",
    delete: "delete"
  };

run();

function run() {
    let argsConfigPath = args.config || args.c;
    let argsData = args.data || args.data;
    let mode = "";
    if(args.create || args.c) mode = mode.create;
    if(args.delete || args.d) mode = mode.delete;

    // Show CLI help
  if (argsHelp) {
    if (argsHelp == true) {
      console.log(message.HELP);
    } else {
      if (argsHelp.toLowerCase() == "config") console.log(message.CONFIGFILE_EXAMPLE);
      if (argsHelp.toLowerCase() == "create") console.log(message.HELP_CREATE);
      if (argsHelp.toLowerCase() == "delete") console.log(message.HELP_DELETE);
      if (argsHelp.toLowerCase() == "debug") console.log(message.HELP_DEBUG);
    }
    return;
  }

  // Show version
  if (argsVersion) {
    console.log(packageInfo.version);
    return;
  }


}

exports.run = run;