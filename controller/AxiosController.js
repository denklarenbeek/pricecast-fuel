const axios = require('axios');
const url = require('url');

const proxy = url.parse(process.env.QUOTAGUARDSTATIC_URL);
const target  = url.parse('https://bbapi.pricecastfuel.com/api/analysis');

axios.defaults.baseURL = 'https://bbapi.pricecastfuel.com/api/analysis';
axios.defaults.headers.common['APP-key'] = process.env.API_KEY;

if(process.env.NODE_ENV === 'production'){
    axios.defaults.proxy = process.env.QUOTAGUARDSTATIC_URL,
    axios.defaults.url = 'https://api.github.com/repos/joyent/node'
    axios.defaults.headers = {
            'User-Agent': 'node.js'
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