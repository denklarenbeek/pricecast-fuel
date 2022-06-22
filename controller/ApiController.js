const {getRequest} = require('./AxiosController');
const {cid} = require('../config');
const mail = require('../utility/email');
const Product = require('../models/Product');
const User = require('../models/User');
const Customer = require('../models/Customer');

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
        console.log('connection error');
        if(error.response.status === 403) {
            res.status(200).send({
                status: 403,
                msg: "Connection Forbidden (check your IP address)",
                connection: false
            });
        } else if(error.response.status === 407) {

            await mail.send({
                user: {
                    email: 'dk@bigbrother.nl'
                },
                filename: 'error',
                subject: 'Proxy Error',
            });


            res.status(200).send({
                status: 407,
                msg: "Proxy server not active",
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

exports.getAllProducts = async (req, res, next) => {
    try {
        // const result = await getRequest('/product')
        const result = await Product.find();
        res.json(result)
    } catch (error) {
        console.error(error)
        throw error
    }
}

exports.autoCompleteUsers = async (req, res, next) => {
    console.log(req.query.q);
    const users = await User
    // first find users that match
    .find({ 
        "name": { 
            "$regex": req.query.q, 
            "$options": "i" 
        }
    })
    // limit to only 5 results
    .limit(5)
    .select(["name", "email", "_id"]);

    res.json(users);
}

exports.autoCompleteCustomer = async (req, res) => {
    const searchKey = req.query.q;
    console.log('hi there')
    try {
        const result = await getRequest(`/station`);
        const stations = result.data;
        const filteredStations = stations.filter(x => x.cid.toLowerCase().includes(searchKey.toLowerCase()))
        const length = filteredStations.length
        // res.send({length, stations: filteredStations});

        let jsonOutput = [];

        for(const station of filteredStations) {
            
            const result = await getRequest(`/station/${station.id}/product`);
        
            for(const product of result.data) {
                const productObj = {}
                productObj.productId = product.id;
                productObj.name = product.name;
                productObj.stationId = station.id;
                productObj.stationName = station.name
                productObj.plu = 0,
                productObj.benchmark = 0

                jsonOutput.push(productObj)
            }

        }

        res.send(jsonOutput);

    } catch (error) {
        
    }

}
