const axios = require('axios');
const debug = require("debug");
const debugParams = debug("params");

function getAccessToken(AUTH_JSON, callback) {
    let accesstoken = "";
    const request = {
        method: "post",
        url: "https://ims-na1.adobelogin.com/ims/token/v3",
        data: {
            client_id: AUTH_JSON.client_id,
            client_secret: AUTH_JSON.client_secret.toString(),
            scope: AUTH_JSON.scope.toString(),
            grant_type: "client_credentials"
        },
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    };

    return new Promise(function (resolve, reject) {
        console.log("Tenant: " + AUTH_JSON.tenant)
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

function createOffers(AUTH_JSON, token, offers, count) {
    return new Promise((resolve, reject) => {
        if (!count) count = 0;
        if (offers.length < 1) {
            console.log("Uploaded " + count + " offers to " + AUTH_JSON.tenant);
            resolve();
        }
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
                // debugParams("Uploaded: " + offer.title);
                console.log("Uploaded: " + offer.title);
            }
            resolve(createOffers(AUTH_JSON, token, offers, count++)); // recursively create offers
        }).catch(error => {
            console.error("Error creating offer: " + offer.title, error.message);
            debugParams(request);
            reject(error);
        });
    });
}

function deleteOffers(AUTH_JSON, token, offersModifiedAt) {
    return new Promise((resolve, reject) => {
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
                    debugParams("Deleting: " + obj.name);
                    delOffers.push(obj);
                }
            }
            console.log("Deleting " + delOffers.length + " Offers");
           // recursiveDelete(AUTH_JSON, token, delOffers);
            resolve();
        })
            .catch((error) => {
                console.error('Error fetching offers:', error.message);
                debugParams(request);
                reject(error);
            });
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