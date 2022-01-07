const axios = require('axios');
const url = require('url');
const HttpsProxyAgent = require('https-proxy-agent');
var ip = require("ip");

const proxy = url.parse(process.env.QUOTAGUARDSTATIC_URL);
const target  = url.parse("https://bbapi.pricecastfuel.com/api/analysis");

axios.defaults.baseURL = 'https://bbapi.pricecastfuel.com/api/analysis';
axios.defaults.headers.common['APP-key'] = process.env.API_KEY;

let options = {
    baseURL: 'https://bbapi.pricecastfuel.com/api/analysis',
    headers: {
        'APP-key': process.env.API_KEY
    }
}

if(process.env.NODE_ENV === 'production'){
    console.log('Application is in production and is using a proxy 💀 🐸 ')
    // axios.defaults.hostname = proxy.hostname;
    // axios.defaults.port = proxy.port || 80;
    // axios.defaults.path = target.href;
    // axios.defaults.headers = {
    //     "Proxy-Authorization": "Basic " + (new Buffer(proxy.auth).toString("base64")),
    //     "Host" : target.hostname,
    //     "APP-key": process.env.API_KEY,
    //   }
    const endpoint = 'https://bbapi.pricecastfuel.com/api/analysis';
    const proxy = process.env.QUOTAGUARDSTATIC_URL;
    const agent = new HttpsProxyAgent(proxy);
    options = {
        uri: url.parse(endpoint),
        agent
    };
}

exports.getRequest = async (url) => {
    try {
        console.dir('ip address', ip.address() )
        console.log(`${url} get request is fired`)
        const res = await axios.get(url, options);
        console.log(res.request.socket.remoteAddress, `and returned a ${typeof(res)}`);
        console.log('headers',res.request.headers)
        return res
    } catch(e) {
        throw e
    }
}  