const multer = require('multer');
const jimp = require('jimp');
const uuid = require('uuid');
const { Readable } = require("stream");
const { v2: cloudinary } = require("cloudinary");


cloudinary.config({
    cloud_name: 'creativeunity',
    api_key: process.env.CLOUDINARY_KEY,
    api_secret: process.env.CLOUDINARY_SECRET
});

const bufferUpload = async (buffer) => {
    return new Promise((resolve, reject) => {
      const writeStream = cloudinary.uploader.upload_stream((err, result) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(result);
      });
      const readStream = new Readable({
        read() {
          this.push(buffer);
          this.push(null);
        },
      });
      readStream.pipe(writeStream);
    });
  };


const multerOptions = {
    storage: multer.memoryStorage(),
    // fileFilter(req, file, next) {
    //     //control if the filetype is an image based on the mimetype (not the the same as extension)
    //     const isPhoto = file.mimetype.startsWith('image/');
    //     if(isPhoto) {
    //         next(null, true);
    //     } else {
    //         next({ message: 'This filetype is\'nt allowed'}, false)
    //     }
    // }
}

//Middleware for uploading photo to the memory of the server, not saving it to the database
exports.upload = multer(multerOptions).single('picture');

exports.uploadMultiple = multer(multerOptions).fields([{ name: 'picture', maxCount: 1 }, { name: 'oldPhoto', maxCount: 1 }])

//Middleware to resize the photo we upload
exports.resize = async (req, res, next) => {
    //check if there is no new file to resize
    if(!req.file && !req.files) {
        next() //skip to the next Middleware
        return
    }

    //If there is one file uploaded
    if(req.file) {
        const extension = req.file.mimetype.split('/')[1]
        //create a unique url for the photo
        req.body.photo = `${uuid.v4()}.${extension}`;
    
        const {buffer} = req.file

        //resize the photo
        const photo = await jimp.read(buffer)
        await photo.resize(800, jimp.AUTO);
        // await photo.write(`./public/uploads/${req.body.photo}`);
        try {
            
            const {secure_url} = await bufferUpload(buffer);

            req.body.picture_url = secure_url
            console.log(`Picture is saved an visible at ${secure_url}`)
            res.status(200).send({status: 200, url: secure_url})
        } catch (error) {
            req.flash('notification',{status: 'error', message: 'Something went wrong uploading the picture'});
            res.send({msg: 'not oke'})
        }
    } else if(req.files) {
        const arr = Object.keys(req.files);
        arr.forEach(async function(key){
            const extension = req.files[key][0].mimetype.split('/')[1]
            
            //create a unique url for the photo
            req.body[key] = `${uuid.v4()}.${extension}`;
        
            //resize the photo
            const photo = await jimp.read(req.files[key][0].buffer)
            await photo.resize(800, jimp.AUTO);
            // await photo.write(`./public/uploads/${req.body[key]}`);
            const upload_result = await bufferUpload(buffer);
        })
            
    }
    
    //once we have written the photo(s) to the cloudinary platform, continue the middleware
    next();
}