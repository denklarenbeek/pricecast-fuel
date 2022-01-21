const Product = require('../models/Product');
const {reportQueue} = require('./QueueController');

exports.checkQueue = async (req, res, next) => {

    const jobs = await reportQueue.getJobs(["active"]);
    res.json(jobs);

}

exports.adminSettings = async (req, res, next) => {

    // Get the productMatrix
    const products = await Product.find().sort('stationName');
    res.render('settings', {products});
}

exports.createNewProduct = async (req, res, next) => {

    const {products} = req.body
    let newProduct;

    if(products) {
        products.forEach(async (product) => {
            const productExist = await Product.findOne({productId: product.productId, stationId: product.stationId})
            if(productExist) {
                console.log(product);
                newProduct = await Product.findOneAndUpdate({productId: product.productId, stationId: product.stationId}, product)
                console.log('Product updated');
                return
            } else {
                newProduct = await Product.create(product);
                console.log(newProduct)
            }
            
        })
        res.redirect('/settings');
    } else {
        req.flash('error', 'No products found');
        res.render('settings');
        return
    }

}