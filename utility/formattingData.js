'use strict';

const {getRequest} = require('../controller/AxiosController');
const moment = require('moment');
const {formatNumber, formatDate} = require('./formatting');
const req = require('express/lib/request');

function sumUp(data, id, productId, prop){
    let totalVolume = 0;
    data.map(location => {
        if(location.stationId === id && location.productId === productId){
            totalVolume += location[prop]
        }
    });
    return totalVolume
};

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

const getPriceSuggestions = async (stationUrl, productUrl, startDate, endDate) => {
    // const date = new Date(endDate);
    let monthEarlier = moment(endDate).subtract(1, 'month').format('YYYY-MM-DDT00:00:00.000');
    monthEarlier += 'Z';
    const priceResult = await getRequest(`/pricesuggestions?stations=${stationUrl}&products=${productUrl}&from=${monthEarlier}&till=${endDate}`);
    return priceResult
}

exports.formatReportData = async (data, info) => {

    const {locations, startDate, endDate, params, customerName, productData} = info;

    const startDateLY = moment(startDate).subtract(1, 'years');
    const endDateLY = moment(endDate).subtract(1, 'years');

    const newDataObj = {
        customerName,
        dates: {
            start_date: formatDate(startDate),
            till_date: formatDate(endDate),
            start_dateLY: formatDate(startDateLY),
            till_dateLY: formatDate(endDateLY),
            duration: ''
        },
        locations: [],
    };

    const durationInDays = moment.duration(moment(endDate) - moment(startDate)).asDays()
    newDataObj.dates.duration = Math.round(durationInDays);


    const listOfLocations = [...new Set(data.map(location => location.stationId))];
    const listOfProducts = [...new Set(data.map(location => location.productId))];

    const priceResult = await getPriceSuggestions(params.stations, params.products, startDate, endDate);
    const pricesuggestions = priceResult.data;
    let productArray = []


    for(let i = 0; i <listOfLocations.length; i++){
        const result = await getRequest(`/station/${listOfLocations[i]}/product`);
        const productDesc = result.data;
        productArray = [...productArray, ...productDesc]
    };

    listOfLocations.forEach(async location => {
        let locationObj = {
            locationId: location,
            locationName: '',
            products: []
        }

        const lookupLocation = locations.find(element => element.id === location);
        locationObj.locationName = lookupLocation.name

        listOfProducts.forEach(product => {
            let productObj = {}
            productObj.productId = product

            const lookupValue = productArray.find(element => element.id === product);
            productObj.name = lookupValue.name;

            if(productData) {

                // Get the right benchmark information
                let benchmarkKey = null;
                productData.forEach(sumProduct => {
                    const key = sumProduct.data.find(element => element.id === product)
                    if(key) {
                        benchmarkKey = key.benchmarkId;
                    }
                })
                
                const benchmarkInfo = productData.find(element => element.benchmarkId === benchmarkKey);
                productObj.benchmarkVolume = formatNumber(benchmarkInfo.totalVolume, 'number');
                productObj.benchmarkVolumeLY = formatNumber(benchmarkInfo.totalVolumeLY, 'number');
                productObj.benchmarkDifference = formatNumber(benchmarkInfo.volumeDifference, 'percentage');
            }


            const totalVolume = sumUp(data, location, product, 'sumVolume')
            const totalVolumeLY = sumUp(data, location, product, 'sumVolumeLY')
            const volumeDifference = (totalVolume - totalVolumeLY);
            const volumeDifferencePercentage = (((totalVolume - totalVolumeLY) / totalVolumeLY) * 100).toFixed(2);
            const volumePerday = (totalVolume/ durationInDays);
            const volumePerDayLY = (totalVolumeLY / durationInDays);
            const volumePerDayDifference = (volumePerday - volumePerDayLY).toFixed(0);
            const totalCost = sumUp(data, location, product, 'sumCost')
            const totalCostLY = sumUp(data, location, product, 'sumCostLY')
            const sumMargin = sumUp(data, location, product, 'sumMargin')
            const sumMarginLY = sumUp(data, location, product, 'sumMarginLY')
            const marginDifference = (sumMargin - sumMarginLY);
            const meanUnitMargin = (sumMargin / totalVolume);
            const meanUnitMarginLY = (sumMarginLY / totalVolumeLY);
            const meanMarginDifference = (meanUnitMargin - meanUnitMarginLY);
            productObj.sumVolume = formatNumber(totalVolume, 'number');
            productObj.sumVolumeLY = formatNumber(totalVolumeLY, 'number');
            productObj.volumeDifference = formatNumber(volumeDifference, 'number');
            productObj.volumeDifferencePerecentage = formatNumber(volumeDifferencePercentage, 'percentage');
            productObj.volumePerday = formatNumber(volumePerday, 'number');
            productObj.volumePerDayLY = formatNumber(volumePerDayLY, 'number');
            productObj.volumePerDayDifference = formatNumber(volumePerDayDifference, 'number');
            productObj.totalCost = formatNumber(totalCost, 'currency', 2);
            productObj.totalCostLY = formatNumber(totalCostLY, 'currency', 2);
            productObj.sumMargin = formatNumber(sumMargin, 'currency', 2);
            productObj.sumMarginLY = formatNumber(sumMarginLY, 'currency', 2);
            productObj.marginDifference = formatNumber(marginDifference, 'currency', 2);
            productObj.meanUnitMargin = formatNumber(meanUnitMargin, 'currency', true);
            productObj.meanUnitMarginLY = formatNumber(meanUnitMarginLY, 'currency', true);
            productObj.meanUnitMarginDifference = formatNumber(meanMarginDifference, 'currency', true);

            // Strategy information
            const strategyArr = pricesuggestions.filter(element => element.stationId === location && element.productId === product);
            const lastindex = strategyArr.length;
            const strategy = strategyArr[lastindex - 2]
            if(strategy !== undefined) {
                productObj.vbi = {
                    value: strategy.vbi,
                    state: vbiState(strategy.vbi),
                    date: formatDate(strategy.timestamp, 'YYYY-MM-DD (HH:MM:SS)')
                };
                productObj.volumeIndex = strategy.volumeIndex;
                productObj.strategy = strategy.strategy ;
                productObj.intensity = strategy.intensity
                productObj.date = strategy.timestamp;
                productObj.competitorBoundaryMin = parseFloat(strategy.raipriceBoundaryMin - strategy.minCompetitorPrice).toFixed(3);
                productObj.competitorBoundaryMax = parseFloat(strategy.raipriceBoundaryMax - strategy.minCompetitorPrice).toFixed(3);
                productObj.boundaryBehaviour = strategy.boundaryBehaviour
            } else {
                productObj.vbi = {
                    value: '',
                    state: ''
                }
                productObj.volumeIndex = '';
                productObj.strategy = '';
                productObj.intensity = '';
                productObj.date = '';
                productObj.competitorBoundaryMin = '';
                productObj.competitorBoundaryMax = '';
            }

            locationObj.products.push(productObj);
        });
        newDataObj.locations.push(locationObj);
    })

    return newDataObj;
}