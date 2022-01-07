const axios = require('axios');
const url = require('url');
const HttpsProxyAgent = require('https-proxy-agent');

const proxy = url.parse(process.env.QUOTAGUARDSTATIC_URL);
const target  = url.parse("https://bbapi.pricecastfuel.com/api/analysis");

axios.defaults.baseURL = 'https://bbapi.pricecastfuel.com/api/analysis';
axios.defaults.headers.common['APP-key'] = process.env.API_KEY;

let options = {};

if(process.env.NODE_ENV === 'production'){
    options = {
        hostname: proxy.hostname,
        port: proxy.port || 80,
        path: target.href,
        headers: {
          "Proxy-Authorization": "Basic " + (new Buffer(proxy.auth).toString("base64")),
          "Host" : target.hostname
        }
      };
      
}

exports.getRequest = async (url) => {
    try {
        console.log(`${url} get request is fired`)
        const res = await axios.get(url, options);
        console.log(res.request.socket.remoteAddress, `and returned a ${typeof(res)}`);
        console.log('IP address',res.request.socket.remoteAddress)
        return res
    } catch(e) {
        console.log('IP address', e.request.socket.remoteAddress)
        throw e
    }
}  