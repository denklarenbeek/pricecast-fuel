'use strict';

const {getRequest} = require('./AxiosController');
const {productMatrix} = require('../productMatrix');
const { formatAPIUrl } = require('../utility/formatting');

const getLoctationsAndProducts = async (resultLocations, body) => {
    let locations = [];
    let products = []

    const cid = body.customer;

    // const resultLocations = await getRequest('/station');
    resultLocations.data.forEach(station => {
        if(station.cid === cid) {
            locations.push({id: station.id, name: station.name});
        }
    })

    const containsProd = Object.keys(body).filter(function (propertyName) {
        return propertyName.indexOf("product-") === 0;
    });

    
    containsProd.forEach(product => {
        const id = product.split('-')[1];
        products.push(id);
    });

    return {locations, products}
}

exports.benchmark = async (req, res, next) => {
    console.log(req.body);

    // return res.json(req.body);

    console.time('report');
    //TODO Fire the resultLocations only once in 4 hours | same as the product parameter
    /**
     * * GET ALL THE LOCATIONS REGISTRED IN THE PCF DASHBAORD
     */
    const allPCFLocations = await getRequest('/station');

    /** 
     * * Filter only the stations related to the request based on the CID
     * * and distinct the products from the select inputs.
    */
    const {locations, products} = await getLoctationsAndProducts(allPCFLocations, req.body)

    req.resultLocations = allPCFLocations;
    req.locations = locations;
    req.products = products;
    
    let prodData = [];
    

    /**
     * * If the benchmark input in not selected continue to next route
     * * Otherwise add Productinformation
     */
    if(req.body.benchmark === 'false') {
        next();
    } else {
        try {
            console.log('inside the benchmark')    
            const addProductInformation = async (products, prodData) => {
                return Promise.all(products.map(async (product) => {
    
                    // Get the benchmark id
                    const pid = productMatrix.filter(productM => {
                        return productM.productId === parseInt(product);
                    });
    
                    const benchmark = pid[0].benchmark;
    
                    // Get the products ID's related to the benchmark ID
                    const benchmarkProducts = productMatrix.filter(productM => {
                        return productM.benchmark === benchmark
                    });
                    
                    const uniqueStations = [...new Set(benchmarkProducts.map(item => item.stationId))];
                    const uniqueProducts = [...new Set(benchmarkProducts.map(item => item.productId))];
    
                    const {stationsUrl, productUrl, from_date, till_date} = formatAPIUrl(uniqueStations, uniqueProducts, req.body.from_date, req.body.till_date)
    
    
                    const {data} = await getRequest(`/aggregation?stations=${stationsUrl}&products=${productUrl}&from=${from_date}&till=${till_date}`);
                    prodData.push(data);
                }));
            }
            await addProductInformation(products, prodData)
            req.info = prodData;
            next();
    
        } catch (error) {
            console.log(error)    
        }
    }
}

function getData (info) {
    const uniqueProducts = [...new Set(info.map(item => item.productId))];

    const productinformation = []

    uniqueProducts.map(product => {
        let newProduct = {
            id: product,
            volume: 0,
            volumeLY: 0,
            margin: 0,
            marginLY: 0,
            benchmarkId: null,
        }

        const pid = productMatrix.filter(productM => {
            return productM.productId === parseInt(product);
        });

        newProduct.benchmarkId = pid[0].benchmark;

        info.map(date => {
            if(date.productId === product){
                newProduct.volume += date.sumVolume
                newProduct.volumeLY += date.sumVolumeLY
                newProduct.margin += date.sumMargin
                newProduct.marginLY += date.sumMargin
            }
        })
        productinformation.push(newProduct);
    })
    // console.log(productinformation);
    return productinformation
}

exports.calculateBenchmark = async (req, res, next) => {

    if(req.body.benchmark === 'false') {
        next();
    } else {

        const customerId = req.body.customer
        const info = req.info;
    
        let productData = [];
        // Get all the unique productsID in the data
        info.forEach((row, index) => {
            const data = getData(row)
            let obj = {
                benchmarkId: data[0].benchmarkId,
                totalLocations: data.length,
                totalVolume: null,
                totalVolumeLY: null,
                volumeDifference: null,
                data: data
            };
            if(obj.benchmarkId === 0) {
                return;
            }
            let totalVolume = data.reduce((sum, line) => sum + line.volume, 0).toFixed(0);
            let totalVolumeLY = data.reduce((sum, line) => sum + line.volumeLY, 0).toFixed(0)
            let volumeDifference = (((totalVolume - totalVolumeLY) / totalVolumeLY) * 100).toFixed(2);
            obj.totalVolume = totalVolume;
            obj.totalVolumeLY = totalVolumeLY;
            obj.volumeDifference = volumeDifference
            productData.push(obj);
        });
        
        req.productData = productData;
        next();
    }

}