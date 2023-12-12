# Adobe Target automations for the MSWuser project
This is an NPM module that takes different Target requirements and automates them. Currently this includes:
 
 * Taking an AIO project download JSOn and converting it into a Postman environment file
 * Taking HTML offers and merging them into a JSON to send to Adobe Target
 * Newman commands that takes a folder of PM environments and uploads the Offers JSON to the associated org.

## Initialization
1. Install NPM
2. Run:
```bash
    npm install
```

## Create Offers JSON

1. Add all HTML offer files to the `offers` folder
2. Add all AIO Project JSON files to `aio-projects`
3. Run
```bash
    node index.js
```
1. Optionall run in debug mode:
```bash
    DEBUG=* node index.js
```