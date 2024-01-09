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
            client_secret: AUTH_JSON.client_secret.toString(),
            scope: AUTH_JSON.scope.toString(),
            grant_type: "client_credentials"
        },
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    };
    debugParams("Tenant: " + AUTH_JSON.tenant)
    return axios(request).then(response => {
        const data = response.data;
        accesstoken = data.access_token;
        return accesstoken;
    }).catch(error => {
        debugParams(request);
        throw new Error("Error in IMS OAuth Request: " + error.message);
    });
}

async function createOffers(AUTH_JSON, token, offers) {
    const request = {
        method: 'post',
        url: `https://mc.adobe.io/${AUTH_JSON.tenant}/target/offers/content`,
        data: {},
        headers: {
            Authorization: `bearer ${token}`,
            'x-api-key': AUTH_JSON.client_id,
            'X-Gw-Ims-Org-Id': AUTH_JSON.org_id,
            'Content-Type': 'application/vnd.adobe.target.v2+json',
        },
    };
    try {
        const results = await Promise.all(offers.map(async (offer) => {
            request.data = {
                name: offer.title,
                content: offer.content,
            };

            try {
                const response = await axios(request);
                const resp = response.data;
                if (resp.error_code) {
                    console.log(resp.message);
                    // console.log('[X]: ' + offer.title);
                    return { error: offer.title, message: resp.message };
                } else {
                    // console.log('[\u2713]: ' + offer.title);
                    return { uploaded:  offer.title };
                }
            } catch (error) {
                debugParams(request);
                throw new Error('Error creating offer: ' + offer.title, error.message);

            }
        }));
        return { [AUTH_JSON.tenant]: results };
    } catch (error) {
        throw new Error('Error:', error);
    }
}


async function deleteOffers(AUTH_JSON, token, offersModifiedAt) {
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
    try {
        const response = await axios(request);
        const offers = response.data.offers;
        try {
            const results = await Promise.all(offers.map(async (offer) => {
                if (offer.modifiedAt.includes(offersModifiedAt)) {
                    debugParams("Deleting: " + offer.name);
                    const delRequest = {
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
                    // return { "deleted": offer.name }; 
                    try {
                        const delResponse = await axios(delRequest)
                        const resp = delResponse.data;
                        if (resp.error_code) {
                            return { error: '[X]: ' + offer.title, message: resp.message };
                        } else {
                            return { "deleted": offer.name }; 
                        }
                    } catch (error) {
                        debugParams(request);
                        throw new Error("Error deleting offer: " + offer.name, error.message);
                    }
                } 
            }));
            return { [AUTH_JSON.tenant]: results.filter(value => value != null) };
        } catch (error) {
            throw new Error('Error:', error);
        }
    } catch (error) {
        debugParams(request);
        throw new Error('Error fetching offers:', error.message);
    }
}

exports.getAccessToken = getAccessToken;
exports.createOffers = createOffers;
exports.deleteOffers = deleteOffers;