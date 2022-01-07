const axios = require('axios');
const url = require('url');

const proxy = url.parse(process.env.QUOTAGUARDSTATIC_URL);
const target  = url.parse('https://bbapi.pricecastfuel.com/api/analysis');

axios.defaults.baseURL = 'https://bbapi.pricecastfuel.com/api/analysis';
axios.defaults.headers.common['APP-key'] = process.env.API_KEY;

if(process.env.NODE_ENV === 'production'){
    axios.defaults.hostname = proxy.hostname;
    axios.defaults.port = proxy.port || 80;
    axios.defaults.path = target.href;
    axios.defaults.headers = {
        "Proxy-Authorization": "Basic " + (new Buffer(proxy.auth).toString("base64")),
        "Host" : target.hostname,
        "APP-key": process.env.API_KEY
      }
}

exports.getRequest = async (url) => {
    try {
        console.log(`${url} get request is fired`)
        const data = await axios.get(url);
        console.log(`and returned a ${typeof(data)}`)
        return data;
    } catch(e) {
        throw e
    }
}