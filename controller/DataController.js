'use strict';

const {getRequest} = require('./AxiosController');
const Product = require('../models/Product');
const moment = require('moment');

moment.locale('nl');

exports.requestData = async (req, res, next) => {

    console.log(req.body);
    /**
     * TODO: Divide the request in a single product/station combination with a max period of 6 months
     * TODO: If Benchmark is required find every product/station combination and create a request with a max period of 6 months
     */
    
    // Get all the registred locations in PCF
    // const allPCFLocations = await getRequest('/station');

    // Retrieve the POST input fields
    const {customer, comparison} = req.body;
    const benchmark = (req.body.benchmark === 'true');
    const from_date = moment.utc(req.body.from_date);
    const till_date = moment.utc(req.body.till_date)
    const from_dateIso = moment.utc(req.body.from_date).toISOString();
    const till_dateIso = moment.utc(req.body.till_date).toISOString();

    let products = [];
    let productids = [];
    let benchmarkIds = [];
    let previousPeriod = false;
    let lastYear = false;
    let periodOfComparison = (till_date.diff(from_date)) / 2629746000;
    let benchmarkProducts = [];

    lastYear = comparison.indexOf('last_year') !== -1;
    previousPeriod = comparison.indexOf('last_period') !== -1
    
    let daybetween = ((till_date.diff(from_date)) / 86400000 )
    let endDateLastPeriod = moment(from_date).toISOString();
    let startDateLastPeriod = moment(endDateLastPeriod).subtract(daybetween, 'days').toISOString();

    // Variable to store all the received data from the API
    let apiData = [];

    // Convert products into arguments
    const productObjectKeys = Object.keys(req.body).filter(function (propertyName) {
        if(propertyName.indexOf("product-") === 0) {
            return propertyName.split('-')[1];
        };
    });
    
    //Push the product ID's tot a array
    for(const product of productObjectKeys) {
        const id = product.split('-')[1];
        productids.push(parseInt(id));
        let matchingProduct = await Product.find({productId: id});
        products = [...products, ...matchingProduct];
    };

    for(const product in products) {
        let productObj = {
            from_date: from_dateIso,
            till_date: till_dateIso,
            station: products[product].stationId,
            product: products[product].productId
        };
        benchmarkProducts.push(productObj);
        if(previousPeriod) {
            let previousperiod = {
                from_date: startDateLastPeriod,
                till_date: endDateLastPeriod,
                station: products[product].stationId,
                product: products[product].productId,
                previous: true
            }
            benchmarkProducts.push(previousperiod);
        };
    };
    
    //Get all benchmark products

    if(benchmark) {
        for(const id of productids) {
            const response = await Product.findOne({productId: id});
            benchmarkIds.push(response.benchmark);
        }
        
        //Get all stations with a benchmark product
        const allProducts = await Product.find();
        for(const id of benchmarkIds) {
            allProducts.map(productM => {
                if(productM.benchmark === id && periodOfComparison < 6.5){
                    let productObj = {
                        from_date: from_dateIso,
                        till_date: till_dateIso,
                        station: productM.stationId,
                        product: productM.productId
                    }
                    benchmarkProducts.push(productObj);
                }
            });
        };
    }
    
    
    
    await Promise.all(benchmarkProducts.map(async (product) => {
        const response = await getRequest(`/aggregation?stations=${product.station}&products=${product.product}&from=${product.from_date}&till=${product.till_date}`)
        //TODO: separate the response in now and last period


        apiData = [...apiData, ...response.data];
        console.log(apiData.length);
    }));

    
    const dataOfLastPeriod = apiData.filter(obj => {

        const startDate = new Date(startDateLastPeriod);
        const endDate = new Date(endDateLastPeriod);

        const date = new Date(obj.date);
        return (date >= startDate && date < endDate)
    })

    const dataOfPresent = apiData.filter(obj => {

        const startDate = new Date(from_date);
        const endDate = new Date(till_date);

        const date = new Date(obj.date);

        return (date >= startDate && date <= endDate)
    })

    // req.apiData = apiData;
    return res.send([{length: dataOfLastPeriod.length,data: dataOfLastPeriod}, {length: dataOfPresent.length, data: dataOfPresent}, {original: apiData}]);
    next();
    // res.json({periodOfComparison, customer, from_date,till_date,comparison, benchmark, apiData});
}