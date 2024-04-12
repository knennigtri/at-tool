<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
# Contents

- [Contents](#contents)
- [Adobe Target automations](#adobe-target-automations)
  - [Command Line Tool](#command-line-tool)
  - [Create config file for Authentication](#create-config-file-for-authentication)
  - [Usage](#usage)
  - [Offer Deletion](#offer-deletion)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

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

Create HTML offers based on a folder of HTML files:
```bash
 at-tool -a aio-auth.json offers:create folder/of/html/files
```

Create a single HTML offer:
```bash
 at-tool -a aio-auth.json offers:create path/to/myOffer.html
```

Delete all offers created in January 2024:
```bash
 at-tool -a aio-auth.json offers:delete "2024-01"
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

Usage: at-tool TYPE:MODE DATA

 TYPE: offers | audiences
 MODE: create | delete

Required:
  -A, --auth <auth.json>      AIO project json or oAuth json

Options:
  -v, --version               Displays version of this package
  -h, --help
  -d, --debug                 See debug Options

Optionally use: at-tool -h auth|offers|audiences
```

## Offer Deletion
Offers are deleted based on the modifiedAt property. The Adobe Target API stores the last modified string as:
`"modifiedAt": "2023-12-20T18:11:22Z"`

The at-tool checks modifiedAt.contains("searchString"). If true, the offer is deleted.