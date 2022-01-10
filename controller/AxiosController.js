const axios = require('axios');
const tunnel = require('tunnel');
const url = require('url');
const HttpsProxyAgent = require('https-proxy-agent');

const proxy = url.parse(process.env.QUOTAGUARDSTATIC_URL);
const target  = url.parse("https://bbapi.pricecastfuel.com/api/analysis");

axios.defaults.baseURL = 'https://bbapi.pricecastfuel.com/api/analysis';
axios.defaults.headers.common['APP-key'] = process.env.API_KEY;

exports.getRequest = async (url) => {

    const agent = tunnel.httpsOverHttp({
        proxy: {
            host: proxy.hostname,
            port: proxy.port || 80,
            proxyAuth: proxy.auth
        }
    });

    let axiosClient;

    if(process.env.NODE_ENV === 'production') {
        axiosClient = axios.create({
            baseURL: target.href,
            httpsAgent: agent,
            proxy: false,
            headers: {
                "Proxy-Authorization": "Basic " + (new Buffer(proxy.auth).toString("base64")),
                "Host" : target.hostname,
                "APP-key": process.env.API_KEY
            }
        });

    } else {
        axiosClient = axios.create({
            baseURL: target.href,
            headers: {
                "APP-key": process.env.API_KEY
            }
        })
    }


    try {
        console.log(`${url} get request is fired`)
        const res = await axiosClient.get(url);
        console.log(res.request.socket.remoteAddress, `and returned a ${typeof(res)}`);
        return res
    } catch (error) {
        console.log(error);
        throw error
    }

}  

exports.proxyRequest = async (url) => {

    let options = {};

    if(process.env.NODE_ENV === 'production'){
        console.log('production')
        options = {

            hostname: proxy.hostname,
            port: proxy.port || 80,
            path: target.href,

            headers: {
                "Proxy-Authorization": "Basic " + (new Buffer(proxy.auth).toString("base64")),
                "Host" : target.hostname,
                "APP-key": process.env.API_KEY
            }
        };
        
    }

    try {
        console.log(options)
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