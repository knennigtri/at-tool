const axios = require('axios');
const debug = require("debug");
const debugParams = debug("params");

function getAccessToken(AUTH_JSON) {
    let accesstoken = "";
    const request = {
        method: "post",
        url: "https://ims-na1.adobelogin.com/ims/token/v3",
        data: {
            client_id: AUTH_JSON.client_id,
            client_secret: AUTH_JSON.client_secret,
            scope: AUTH_JSON.scope,
            grant_type: "client_credentials"
        },
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    };
    
    return new Promise(function (resolve, reject) { 
        axios(request).then(response => {
            const data = response.data;
            accesstoken = data.access_token;
            resolve(accesstoken);
        }).catch(error => {
            reject("Error in IMS OAuth Request: " + error.message);
            debugParams(request);
        });
    });
}

function createOffers(AUTH_JSON, token, offers) {
    if (offers.length < 1) return;
    const offer = offers[offers.length - 1]; // Grab last offer in the array
    offers.pop(); // Remove last offer in array for recursion

    const request = {
        method: "post",
        url: "https://mc.adobe.io/" + AUTH_JSON.tenant + "/target/offers/content",
        data: {
            name: offer.title,
            content: offer.content
        },
        headers: {
            Authorization: `bearer ${token}`,
            'x-api-key': AUTH_JSON.client_id,
            'X-Gw-Ims-Org-Id': AUTH_JSON.org_id,
            'Content-Type': 'application/vnd.adobe.target.v2+json'
        }
    };

    axios(request).then(response => {
            const resp = response.data;

            if (resp.error_code) {
                console.log(resp.message);
            } else {
                console.log("Uploaded: " + offer.title);
            }
            createOffers(AUTH_JSON, token, offers); // recursively create offers
    }).catch(error => {
        console.error("Error creating offer: " + offer.title, error.message);
        debugParams(request);
    });
}

function deleteOffers(AUTH_JSON, token, offersModifiedAt) {
    const request = {
        method: "get",
        url: "https://mc.adobe.io/" + AUTH_JSON.tenant + "/target/offers",
        data: {},
        headers: {
            Authorization: `bearer ${token}`,
            'x-api-key': AUTH_JSON.client_id,
            'X-Gw-Ims-Org-Id': AUTH_JSON.org_id,
            'Content-Type': 'application/vnd.adobe.target.v2+json',
        }
    }
    axios(request).then((response) => {
            const res = response.data;
            let delOffers = [];
            for (const obj of res.offers) {
                if (obj.modifiedAt.includes(offersModifiedAt)) {
                    // console.log("Deleting: " + obj.name);
                    delOffers.push(obj);
                }
            }
            console.log("Deleting " +delOffers.length+ " Offers");
            recursiveDelete(AUTH_JSON, token, delOffers);
        })
    .catch((error) => {
        console.error('Error fetching offers:', error.message);
        debugParams(request);
    });
}

function recursiveDelete(AUTH_JSON, token, offers) {
    if (offers.length < 1) return;
    const offer = offers[offers.length - 1]; // Grab last offer in the array
    offers.pop(); // Remove last offer in array for recursion
    const request = {
        method: "delete",
        url: "https://mc.adobe.io/" + AUTH_JSON.tenant + "/target/offers/content/" + offer.id,
        data: {},
        headers: {
            Authorization: `bearer ${token}`,
            'x-api-key': AUTH_JSON.client_id,
            'X-Gw-Ims-Org-Id': AUTH_JSON.org_id,
            'Content-Type': 'application/vnd.adobe.target.v2+json',
        }
    }
    axios(request).then(response => {
        const resp = response.data;
        if (resp.error_code) {
            console.log(resp.message);
        } else {
            console.log("Deleted: " + offer.name)
        }
        recursiveDelete(AUTH_JSON, token, offers);
    }).catch(error => {
        console.error("Error deleting offer: " + offer.name, error.message);
        debugParams(request);
    });
}

exports.getAccessToken = getAccessToken;
exports.createOffers = createOffers;
exports.deleteOffers = deleteOffers;