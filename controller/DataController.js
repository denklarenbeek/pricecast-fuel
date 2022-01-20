'use strict';

const {getRequest} = require('./AxiosController');
const {formatDate, formatNumber} = require('../utility/formatting');
const Product = require('../models/Product');
const Report = require('../models/Report');
const moment = require('moment');
const { benchmark } = require('./BenchmarkController');

moment.locale('nl');

exports.requestData = async (req, jobId) => {

    console.log(req.body);
    /**
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
    
    //Get all benchmark products
    if(benchmark) {
        for(const id of productids) {
            const response = await Product.findOne({productId: id});
            benchmarkIds.push(response.benchmark);
        }
        
        const allProducts = await Product.find();
        //Get all stations with a benchmark product
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
    } else {
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
    }
    
    await Promise.all(benchmarkProducts.map(async (product) => {
        const response = await getRequest(`/aggregation?stations=${product.station}&products=${product.product}&from=${product.from_date}&till=${product.till_date}`)

        apiData = [...apiData, ...response.data];
        console.log(apiData.length);
    }));

    
    const dataOfLastPeriod = apiData.filter(obj => {

        const startDate = new Date(startDateLastPeriod);
        const endDate = new Date(endDateLastPeriod);

        const date = new Date(obj.date);
        return (date >= startDate && date < endDate)
    });

    const dataOfPresent = apiData.filter(obj => {

        const startDate = new Date(from_date);
        const endDate = new Date(till_date);

        const date = new Date(obj.date);

        return (date >= startDate && date <= endDate)
    });

    let stationData = [];
    let benchmarkData = []

    const ownStations = [...new Set(products.map(item => item.stationId))];

    for(const station of ownStations) {

        //Filter out the own stations to present in a separate Array;
        const newStation = dataOfPresent.filter(record => {
            return record.stationId === station;
        });

        stationData = [...stationData, ...newStation];

        //Remove the own stations an only keep the record which are not owned stations
        const newData = dataOfPresent.filter(record => {
            return record.stationId !== parseInt(station)
        });
        // console.log(newData);
        benchmarkData = [...benchmarkData, ...newData];
    };

    const calculatedBenchmark = await this.calculateBenchmarkv2(benchmarkData, products);
    
    const pricesuggestions = await this.getPriceSuggestions(products, from_dateIso, till_dateIso);

    const returnObj = {
        daybetween,
        customer,
        dates: {
            from: req.body.from_date,
            till: req.body.till_date
        },
        ownStationData: {
            products,
            stations: ownStations,
            thisYear: stationData
        },
        benchamarkStationData: calculatedBenchmark,
        pricesuggestions
    }

    const reportData = await this.formatReportData(returnObj, jobId);
    const savedReport = await Report.create(reportData);
    return savedReport

}

exports.calculateBenchmarkv2 = async (info, products) => {

    const uniqueBenchMarkIDs = [...new Set(products.map(item => item.benchmark))];

    let benchmarkData = [];
    let dataX = []

    // Find the benchmark ID of every day and add that to the information.
    for(const product of info) {
        let newProduct = {...product};
        const product_db = await Product.findOne({productId: product.productId});
        newProduct.benchmark = product_db.benchmark;
        benchmarkData.push(newProduct);
    }

    for(const id of uniqueBenchMarkIDs) {
        let newObj = {
            benchmark: id,
            volume: 0,
            volumeLY: 0,
            volumeDifference: 0,
        }
        
        const idData = benchmarkData.filter(record => {
            return record.benchmark === id && record.sumVolumeLY !== 0
        });

        const totalVolume = idData.reduce((sum, line) => sum + line.sumVolume, 0).toFixed(0);
        const totalVolumeLY = idData.reduce((sum, line) => sum + line.sumVolumeLY, 0).toFixed(0);
        const totalVolumeDifference = (((totalVolume - totalVolumeLY) / totalVolumeLY) * 100).toFixed(2);

        newObj.volume = totalVolume;
        newObj.volumeLY = totalVolumeLY;
        newObj.volumeDifference = totalVolumeDifference;
        dataX.push(newObj);
    }
    return dataX;

};

exports.getPriceSuggestions = async (products, from, till) => {
    let pricesuggestions = [];
    // console.log(products);
    await Promise.all(products.map(async (product) => {
        const response = await getRequest(`/pricesuggestions?stations=${product.stationId}&products=${product.productId}&from=${from}&till=${till}`)

        pricesuggestions = [...pricesuggestions, ...response.data];
    }));
    return pricesuggestions;
}

function formatDifference(thisYear, lastYear, decimal) {
    const difference = (thisYear - lastYear);
    const state = difference > 0 ? 'positive' : 'negative';
    const percentage = (((thisYear - lastYear) / lastYear) * 100).toFixed(2);
    return {
        number: {
            value: difference, 
            state
        }, 
        percentage: {
            value: percentage,
            state
        }
    }
}

const vbiState = (vbi) => {
    let state = '';
    if(parseInt(vbi) < 80) {
        state = 'red'
    } else if(parseInt(vbi) > 80 && parseInt(vbi) < 120) {
        state = 'green'
    } else {
        state = 'orange'
    }
    return state;
}

exports.formatReportData = async (data, reportID) => {
    const {customer, dates, ownStationData, pricesuggestions, benchamarkStationData, daybetween} = data;

    let reportData = {
        customer,
        reportId: reportID,
        dates: {
            from_date: dates.from,
            till_date: dates.till
        },
        locations: []
    };

    for(const station of ownStationData.stations) {
        const {stationName} = await Product.findOne({stationId: station});
        let newStationObj = {
            stationId: station,
            name: stationName,
            products: []
        };
        
        for(const product of ownStationData.products) {
            if(product.stationId === station) {
                let filteredData = ownStationData.thisYear.filter(item => {
                    return item.productId === product.productId && item.stationId === product.stationId
                });

                // Format the volume data per product
                const totalVolume = filteredData.reduce((sum, record) => { return sum + record.sumVolume}, 0).toFixed(0);
                const totalVolumeLY = filteredData.reduce((sum, record) => { return sum + record.sumVolumeLY}, 0).toFixed(0);
                const totalVolumeDifference = formatDifference(totalVolume, totalVolumeLY, 0);
                const volumePerDay = (totalVolume / daybetween).toFixed(0);
                const volumePerDayLY = (totalVolumeLY / daybetween).toFixed(0);
                const volumePerDayDifference = formatDifference(volumePerDay, volumePerDayLY, 0);
                const sumMargin = filteredData.reduce((sum, record) => { return sum + record.sumMargin}, 0);
                const sumMarginLY = filteredData.reduce((sum, record) => { return sum + record.sumMarginLY}, 0);
                const sumMarginDifference = formatDifference(sumMargin, sumMarginLY, 2);
                const unitMargin = (sumMargin / totalVolume);
                const unitMarginLY = (sumMarginLY / totalVolumeLY);
                const unitMarginDifference = formatDifference(unitMargin, unitMarginLY, 4);
                const countTransactions = filteredData.reduce((sum, record) => { return sum + record.countTransactions}, 0).toFixed(0);
                const countTransactionsLY = filteredData.reduce((sum, record) => { return sum + record.countTransactionsLY}, 0).toFixed(0);
                const countTransactionsDifference = formatDifference(countTransactions, countTransactionsLY, 0);

                // Get the Strategy information of the product
                const stationsPricesuggestions = pricesuggestions.filter(element => element.productId === product.productId && element.stationId === station);
                const indexArray = (stationsPricesuggestions.length - 1);
                const latestPricesuggesion = stationsPricesuggestions[indexArray];
                
                let strategy = {
                    name: latestPricesuggesion.strategy,
                    minBandwith: parseFloat(latestPricesuggesion.raipriceBoundaryMin - latestPricesuggesion.minCompetitorPrice).toFixed(3),
                    maxBandwith: parseFloat(latestPricesuggesion.raipriceBoundaryMax - latestPricesuggesion.minCompetitorPrice).toFixed(3),
                    intensity: latestPricesuggesion.intensity,
                    bandwithBehaviour: latestPricesuggesion.boundaryBehaviour,
                    vbi: {
                        state: vbiState(latestPricesuggesion.vbi),
                        value: latestPricesuggesion.vbi,
                        date: formatDate(latestPricesuggesion.timestamp, 'YYYY-MM-DD (HH:MM:SS)')
                    },
                    volumeIndex: latestPricesuggesion.volumeIndex
                };

                const benchMarkData = benchamarkStationData.find(record => record.benchmark === product.benchmark);

                let newProductObj = {
                    productId: product.productId,
                    name: product.name,
                    benchmarkId: product.benchmark,
                    volume: formatNumber(totalVolume, 'number'),
                    volumeLY: formatNumber(totalVolumeLY, 'number'),
                    volumeDifference: formatNumber(totalVolumeDifference.number.value, 'number'),
                    volumeDifferencePercentage: formatNumber(totalVolumeDifference.percentage.value, 'number'),
                    volumePerDay: formatNumber(volumePerDay, 'number'),
                    volumePerDayLY: formatNumber(volumePerDayLY, 'number'),
                    volumePerDayDifference: formatNumber(volumePerDayDifference.number.value, 'number'),
                    margin: formatNumber(sumMargin, 'currency', 2),
                    marginLY: formatNumber(sumMarginLY, 'currency', 2),
                    marginDifference: formatNumber(sumMarginDifference.number.value, 'currency', 2),
                    unitMargin: formatNumber(unitMargin, 'currency', 4),
                    unitMarginLY: formatNumber(unitMarginLY, 'currency', 4),
                    unitMarginDifference: formatNumber(unitMarginDifference.number.value, 'currency', 4),
                    countTransactions: formatNumber(countTransactions, 'number'),
                    countTransactionsLY: formatNumber(countTransactionsLY, 'number'),
                    countTransactionsDifference: formatNumber(countTransactionsDifference.number.value, 'number'),
                    strategy,
                    benchmark: {
                        value: benchMarkData.volumeDifference,
                        state: benchMarkData.volumeDifference > 0 ? 'positive' : 'negative'
                    },
                    pricesuggestions: stationsPricesuggestions
                };
                newStationObj.products.push(newProductObj);
            }
        }
        reportData.locations.push(newStationObj);

    }
    return reportData

    /*
        FORMAT the data so we get the following data structure:
        [
            dates: {
                from_date: String,
                till_date: String
            },
            locations: [
                {
                    stationId: Number,
                    name: String,
                    products: [
                        {
                            productId: Number,
                            name: String,
                            volume: Number,
                            volumeLY: Number,
                            volumeDifference: {
                                value: Number,
                                state: String
                            },
                            volumeDifferencePercentage: {
                                value: Number,
                                state: String
                            },
                            margin: Number,
                            marginLY: Number,
                            marginDifference: {
                                value: Number,
                                state: String
                            },
                            unitMargin: Number,
                            unitMarginLY: Number,
                            unitMarginDifference: {
                                value: Number,
                                state: String
                            },
                            countTransactions: Number,
                            countTransactionsLY: Number,
                            countTransactionsDifference: {
                                value: Number,
                                state: String
                            },
                            strategy: {
                                strategy: String,
                                minBandwith: String,
                                maxBandwith: String,
                                bandwithBehaviour: String,
                                intensity: String,
                                vbi: {
                                    value: String,
                                    state: String
                                }
                            },
                            benchmark: {
                                value: Number,
                                state: String
                            }
                        }
                    ]
                }
            ]
        ]
    */


}