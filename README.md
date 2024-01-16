# Adobe Target automations
Actions currently supported:
 * Create Target offers based on HTML files
 * Delete Target offers based on modifiedAt string

## Command Line Tool

Run commands on a **single** Adobe organization
```bash
 at-tool -a aio-auth.json [ARGS]
```

Run commands on **many** Adobe organizations
```bash
 at-tool -a path/to/auth/jsons [ARGS]
```

Create HTML offers based ona folder of HTML files:
```bash
 at-tool -a aio-auth.json --create folder/of/html/files
```

Create a single HTML offer:
```bash
 at-tool -a aio-auth.json --create path/to/myOffer.html
```

Delete all offers created in January 2024:
```bash
 at-tool -a aio-auth.json --delete "2024-01"
```

## Create config file for Authentication
1. Create and [Adobe IO project](https://developer.adobe.com/dep/guides/dev-console/create-project/)
   1. Add the **Adobe Target API**
      1. Select **oAuth** Credentials
   2. Go to the Credentials screen and download the JSON.

For OAuth credentials, verify the JSON contains at least:
    
```json
{
  "ORG_ID": "xxxxxxxxxxxxxxxxxxxxx@AdobeOrg",
  "CLIENT_SECRETS": [ "xxxxxxxxxxxxxxxxxxxxx" ],
  "CLIENT_ID": "xxxxxxxxxxxxxxxxxxxxx",
  "SCOPES": [
    "xxxxxxxxx",
    "xxxxxxxxx",
    "xxxxxxxxx"
  ]
}
```
> If running this tool with many Adobe Organizations, you will need to create a AIO Project and download the oAuth json per Organization. Add all the jsons to a single folder to run the tool against all Adobe organizations using `at-tool -a path/to/aio/jsons/`

## Usage 
```bash
at-tool -h

Usage: at-tool [ARGS]
 Arguments:
    -a, --auth <auth.json>                 AIO project json or oAuth json
    -D, --delete <String>       [Mode] Deletes all offers modifiedAt containing <String>              
    -C, --create <path>         [Mode] Creates offer(s) at the given path
    -v, --version               Displays version of this package
    -h, --help
               auth
               create 
               delete
               debug
```

## Create HTML Offers
//TODO

## Delete HTML Offers
Quickly delete offers based on the modifiedAt key. The Adobe Target API stores the last modified string as:
`"modifiedAt": "2023-12-20T18:11:22Z"`

The at-tool checks modifiedAt.contains("searchString"). If true, the tool deletes the offer.

```bash
 at-tool -a aio-auth.json --delete "2024-01"
```