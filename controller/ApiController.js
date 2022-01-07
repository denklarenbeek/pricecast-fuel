const {getRequest} = require('./AxiosController');
const {formatReportData} = require('../utility/formattingData');
const {cid} = require('../config');
const moment = require('moment');
const { formatAPIUrl } = require('../utility/formatting');

moment.locale('nl')

exports.checkConnection = async (req, res) => {
    try {
        const status = await getRequest('/ping');
        if(status.data === 'pong') {
            res.status(200).send({
                status: 200,
                msg: 'Connection Established',
                connection: true
            })
        }
    } catch (error) {
        console.log(error.message);
        if(error.response.status === 403) {
            res.status(200).send({
                status: 403,
                msg: "Connection Forbidden (check your IP address)",
                connection: false
            });
        }

    }
}   

exports.getAllStations = async (req, res, next) => {
    const stations = await getRequest('/station');
    res.json({stations: stations.data, cid});
};

exports.getProductsByCid = async (req, res, next) => {
    const stationId = req.params.stationId;
    try {
        const result = await getRequest(`/station/${stationId}/product`);
        res.json({products: result.data});
    } catch (error) {
        console.error(error)
        throw error
    }
};

exports.generateReport = async (req, res, next) => {

    const {locations, products} = req;

    const cid = req.body.customer;

    const uniqueStations = [...new Set(locations.map(item => item.id))];

    const {stationsUrl, productUrl, from_date, till_date} = formatAPIUrl(uniqueStations, products, req.body.from_date, req.body.till_date);

    try {
        const {data} = await getRequest(`/aggregation?stations=${stationsUrl}&products=${productUrl}&from=${from_date}&till=${till_date}`);

        let info = {
            customerName: cid,
            startDate: from_date,
            endDate: till_date,
            products: products,
            locations,
            productData: req.productData,
            params: {
                stations: stationsUrl,
                products: productUrl
            }
        }

        const response = await formatReportData(data, info);
        console.timeEnd('report');
        res.render('report', {data: response});
    } catch (error) {  
        console.log(error);
        throw error;
    }
}