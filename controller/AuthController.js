const speakeasy = require('speakeasy');
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const QRCode = require('qrcode')
const User = require('../models/User');
const Token = require('../models/Token');
const saltRounds = 10;
const {getRequest} = require('./AxiosController');
const mail = require('../utility/email');

exports.authtest = (req, res, next) => {
    res.send({msg: 'API ROUTE OKE!'})
};

exports.generateToken = async (req, res,next) => {

    try {
        if(req.headers['reset-key'] === process.env.RESET_KEY || req.session.user.administrator){
            
            const {email} = req.body;
            const expire_date = Date.now() + 86400000;
            const token = crypto.randomBytes(48).toString('hex');
            
            const newToken = {
                token,
                expire_date,
                email
            }
            const savedToken = await Token.create(newToken);
            const resetURL = `http://${req.headers.host}/register?token=${savedToken.token}`;
    
            const emailInformation = await mail.send({
                user: {
                    email
                },
                filename: 'register',
                subject: 'Register',
                resetURL
            });
    
            req.flash('notification', {status: 'success', message: 'Invitation send'});
            res.redirect('/settings');

        } else {
            req.flash('notification', {status: 'error', message: 'Did not understand that action'});
            res.status(500);
            return
        }
    } catch (error) {
        console.log(error)
        res.status(500).json({msg: 'Check logs', error})
    }


}

exports.tokenRoute = async (req,res,next) => {
    if(!req.query.token) {
        req.flash('notification', {status: 'error', message: 'Invalid Register Token'})
        res.redirect('/')
        return
    } else {
        // Check if token & expiring date is valid
        const token = await Token.findOne({token: req.query.token});
        const valid = Date.now() < token.expire_date;
        if(token && valid) {
            req.email = token.email;
            await Token.findOneAndDelete({token: token.token})
            next()
        }
    }
}

exports.authRoute = async (req, res, next) => {
    if(req.session.authenticated) {
        next()
    } else {
        req.flash('notification', {status: 'error', message: 'You are not allowed to do that'});
        res.redirect('/login')
    }
}

exports.adminRoute = async (req, res, next) => {
    if(!req.session.user.administrator) {
        req.flash('notification', {status: 'error', message: 'You are not allowed to do that'});
        res.redirect('/')
    } else {
        next()
    }
}

exports.logout = async (req, res, next) => {
    console.log('logout');
    res.cookie(process.env.KEY, '', {expires: new Date(0)})
    req.session.authenticated = false;
    res.status(200).json({msg: true})
}

exports.login = async (req, res, next) => {

    const {email, password} = req.body;
    try {
        const user = await User.findOne({email: email.toLowerCase()});

        if(!user) return res.json({msg: 'Invalid credentials'});

        //Compare the hashed password
        const validPassword = await bcrypt.compare(password, user.password);

        if(validPassword) {
            res.status(200).json({validPassword: true})
        } else {
            req.flash('notification', {status: 'error', message: 'Invalid Credentials'});
            res.redirect('/login');
        }
    } catch (error) {
        console.error(error)
        req.flash('notification', {status: 'error', message: 'Invalid Credentials'});
        res.redirect('/login');
    }

}

exports.register = async (req, res, next) => {
    
    const {name, email, password, password2} = req.body;
    if(password !== password2) res.status(500).json({msg: 'Credentials invalid: no matching passwords'});

    try {
        // Check if user already exists
        const userExists = await User.findOne({email});

        if(userExists) {
            req.flash('notification',  {status: 'info', message: 'Credentials already exists, want to login?'});
            res.redirect('/login');
            return 
        }

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
        req.flash('notification', {status: 'success', message: `You are now registred with ${user.email}! Please verify 2fa 👋`});
        res.render('authenticate', {qrcode, email: user.email});
    } catch (error) {
        console.log(error);
        req.flash('notification',{status: 'error', message: 'Something went wrong: Registration is not completed'});
        res.redirect('/register')
    }
};

exports.verifySecret = async (req, res) => {
    const {email, token, id} = req.body;

    try {
        const user = await User.findOne({email}, '-password')

        const {base32:secret} = user.temp_secret;

        const verified = speakeasy.totp.verify({
            secret,
            encoding: 'base32',
            token
        });

        if(verified) {
            const savedUser = await User.findOneAndUpdate({email}, {secret: user.temp_secret, temp_secret: null}, {new: true});
            req.session.authenticated = true
            req.session.user = user;
            req.flash('notification',{status: 'success', message: 'You 2 factor authentication is successfully enabled'});
            res.redirect('/');
        } else {
            req.flash('notification',{status: 'error', message: 'Something went wrong: Two Factor Authentication is not enabled'});
            res.redirect('/register')
        }

    } catch (error) {
        console.log(error);
        req.flash('notification',{status: 'error', message: 'Something went wrong: Two Factor Authentication is not enabled'});
        res.redirect('/register')
    }
}

exports.validateSecret = async (req, res) => {
    const {email, token} = req.body;

    try {
        const user = await User.findOne({email: email.toLowerCase()}, '-password')

        const {base32:secret} = user.secret;

        const tokenValidates = speakeasy.totp.verify({
            secret,
            encoding: 'base32',
            token,
            window: 1
        });

        if(tokenValidates) {
            req.session.authenticated = true;
            req.session.user = user;
            req.flash('notification',{status: 'success', message: 'Logged in successfully'})
            res.redirect('/')
        } else {
            req.flash('notification',{status: 'error', message: 'Something went wrong: Your token is invalid'})
            res.redirect('/login');
        }

    } catch (error) {
        console.log(error);
        req.flash('notification',{status: 'error', message: 'Something went wrong......'})
        res.redirect('/login');
    }
}