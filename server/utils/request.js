'use strict'
// const axios = require('axios')
import axios from 'axios';
function sendRequest({method, url, params = {}, data = {}, headers = {}}) {
    return axios({
        method,
        url,
        params,
        data,
        headers
    }).then((response) => {
        return response.data
    }).catch(error => {
        console.log("error:", error);
        const response = error.response
        return response || {}
    })
}
const http = {
    get({url, params, headers}) {
        return sendRequest({method: 'get', url, params, headers})
    },
    post({url, data, headers, params}) {
        return sendRequest({method: 'post', url, params: params, data: data, headers})
    },
    patch(url, params) {
        return sendRequest({method: 'patch', url, data: params})
    },
    put(url, params, headers) {
        return sendRequest({method: 'put', url, data: params, headers})
    },
    delete(url, params) {
        return sendRequest({method: 'delete', url, params})
    }
}
export {http}
