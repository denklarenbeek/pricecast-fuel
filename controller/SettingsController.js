const Product = require('../models/Product');
const {reportQueue} = require('./QueueController');

exports.checkQueue = async (req, res, next) => {

    const jobs = await reportQueue.getJobs(["active"]);
    res.json(jobs);

}

exports.getBenchmarkProducts = async (req, res, next) => {

    // Get the productMatrix
    const products = await Product.find().sort('stationName');
    res.render('productMatrix', {products});
}

exports.createNewProduct = async (req, res) => {

    const products = req.body;
    let newProduct;

    console.log(req.body);

    if(products) {
        products.forEach(async (product) => {
            const productExist = await Product.findOne({productId: product.productId, stationId: product.stationId})
            if(productExist) {
                newProduct = await Product.findOneAndUpdate({productId: product.productId, stationId: product.stationId}, product)
                req.flash('notification', {status: 'success', message: 'The product is updated'});
            } else {
                newProduct = await Product.create(product);
                req.flash('notification', {status: 'success', message: 'The product is created'});
                console.log(newProduct)
            }
            return res.status(200).json({status: 'success'})
            
        })
    } else {
        req.flash('notification',{status: 'error', message: 'No products found'});
        return res.status(200).json({status: 'error', message: 'There were no products found'});
    }
}