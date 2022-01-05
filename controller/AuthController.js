const speakeasy = require('speakeasy');
const bcrypt = require('bcrypt');
const QRCode = require('qrcode')
const User = require('../models/User');
const saltRounds = 10;

exports.authtest = (req, res, next) => {
    res.send({msg: 'API ROUTE OKE!'})
};

exports.authRoute = async (req, res, next) => {
    if(req.session.authenticated) {
        next()
    } else {
        res.redirect('/login')
    }
}

exports.login = async (req, res, next) => {

    const {email, password} = req.body;
    try {
        console.log(email);
        const user = await User.findOne({email: email.toLowerCase()});

        if(!user) return res.json({msg: 'Invalid credentials'});

        //TODO: compare the hashed password
        const validPassword = await bcrypt.compare(password, user.password);

        if(validPassword) {
            res.status(200).json({validPassword: true})
        } else {
            return res.json({msg: 'Invalid credentials'})
        }
    } catch (error) {
        console.error(error)
        res.status(500).json(error)
    }

}

exports.register = async (req, res, next) => {
    
    const {name, email, password, password2} = req.body;
    if(password !== password2) res.status(500).json({msg: 'Credentials invalid: no matching passwords'});

    try {
        // Check if user already exists
        const userExists = await User.findOne({email});
        //TODO: Add render to register form with REQ.FLASHES IN THE SESSION
        if(userExists) return res.status(500).json({msg: 'Credentials invalid: User already exists'});

        // Hash password
        const encryptPassword = await bcrypt.hash(password, saltRounds);

        const temp_secret = speakeasy.generateSecret({name: 'PriceCast Fuel'});
        const newUser = {
            name,
            email: email.toLowerCase(),
            temp_secret,
            password: encryptPassword
        };
        const user = await User.create(newUser);

        // Generate QR code URL
        const qrcode = await QRCode.toDataURL(temp_secret.otpauth_url);

        res.render('authenticate', {qrcode, email: user.email});
    } catch (error) {
        console.log(error);
        res.status(500).json({msg: 'Error on creating use'})
    }
};

exports.verifySecret = async (req, res) => {
    const {email, token, id} = req.body;

    console.log(email);

    try {
        const user = await User.findOne({email}, '-password')

        const {base32:secret} = user.temp_secret;

        console.log(secret);
        const verified = speakeasy.totp.verify({
            secret,
            encoding: 'base32',
            token
        });

        if(verified) {
            const savedUser = await User.findOneAndUpdate({email}, {secret: user.temp_secret, temp_secret: null}, {new: true});
            req.session.authenticated = true
            res.redirect('/');
        } else {
            res.redirect('/login')
        }

    } catch (error) {
        console.log(error);
        res.status(500).json({msg: 'Error on creating use'})
    }
}

exports.validateSecret = async (req, res) => {
    const {email, token} = req.body;

    try {
        const user = await User.findOne({email: email.toLowerCase()}, '-password')

        const {base32:secret} = user.secret;

        console.log(secret);
        const tokenValidates = speakeasy.totp.verify({
            secret,
            encoding: 'base32',
            token,
            window: 1
        });

        if(tokenValidates) {
            req.session.authenticated = true;
            res.redirect('/')
        } else {
            res.json({validated: false})
        }

    } catch (error) {
        console.log(error);
        res.status(500).json({msg: 'Error on creating use'})
    }
}