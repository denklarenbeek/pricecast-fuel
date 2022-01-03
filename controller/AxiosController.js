const axios = require('axios');

axios.defaults.baseURL = 'https://bbapi.pricecastfuel.com/api/analysis';
axios.defaults.headers.common['APP-key'] = process.env.API_KEY;

exports.getRequest = async (url) => {
    try {
        console.time('request')
        console.log(`${url} get request is fired`)
        const data = await axios.get(url);
        console.log(`and returned a ${typeof(data)}`)
        console.timeEnd('request')
        return data;
    } catch(e) {
        throw e
    }
}