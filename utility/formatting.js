const numeral = require('numeral');
const moment = require('moment');

numeral.register('locale', 'nl', {
    delimiters: {
        thousands: '.',
        decimal: ','
    },
    abbreviations: {
        thousand: 'k',
        million: 'm',
        billion: 'b',
        trillion: 't'
    },
    ordinal : function (number) {
        return number === 1 ? 'er' : 'ème';
    },
    currency: {
        symbol: '€'
    }
});

// switch between locales
numeral.locale('nl');

exports.formatNumber = (num, type, decimals=false) => {

    if(type === 'percentage'){

        if(parseFloat(num) < 0){
            const value = num;
            const state = 'negative'
            return {state, value}
        } else {
            const value = num;
            const state = 'positive'
            return {state, value}
        }
    }
    
    if(type === 'number'){
        const number = Math.round(num)
        const state = parseInt(number) >= 0 ? 'positive' : 'negative';
        const value = numeral(number).format('0,0');
        return {value, state}
    } 
    if(type === 'currency'){
        let value = ''
        if(!decimals) { 
            value = numeral(num).format('$ 0,0');
        } else if(decimals === 2) {
            value = numeral(num).format('$ 0,0.00');
        } else {
            value = numeral(num).format('$ 0,0.0000')
        }
        const state = parseFloat(num) > 0 ? 'positive' : 'negative'
        return {value, state}
    }
}

exports.formatDate = (date, format = "DD-MM-YYYY") => {
    let newDate = ''
    if(format === 'DD-MM-YYYY') {
        newDate = moment(date).format("DD-MM-YYYY")
    } else 
        newDate = moment(date).format(format)
    return newDate
}

exports.duration = (startDate, endDate) => {
    let duration = {}
    duration.days = moment(endDate).diff(startDate, 'days');
    duration.weeks = moment(endDate).diff(startDate, 'weeks');
    duration.months = moment(endDate).diff(startDate, 'months');
    return duration
}

exports.formatAPIUrl = (stations, products, from, till) => {

    // Create an aggeratation URL
    let stationsUrl = '';
    let productUrl = '';

    stations.forEach(location => {
        stationsUrl += `${location},`;
    });

    products.forEach(product => {
        productUrl += `${product},`
    });

    const editStationUrl = stationsUrl.substring(0, stationsUrl.length - 1);
    const editProductUrl = productUrl.substring(0, productUrl.length - 1);

    console.log(from, 'TILL_DATE',till);

    let formatFromDate = moment(from).format('YYYY-MM-DDT00:00:00.000')
    formatFromDate += 'Z';
    let formatTillDate = moment(till).add(1, 'days').format('YYYY-MM-DDT00:00:00.000')
    formatTillDate += 'Z';
    
    return {stationsUrl: editStationUrl, productUrl: editProductUrl, from_date: formatFromDate, till_date: formatTillDate}
}