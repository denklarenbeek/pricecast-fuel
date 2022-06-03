const User = require('../models/User');
const Contact = require('../models/Contact');
const {addMailToQueue} = require('./QueueController');
const {ExportToCsv} = require('export-to-csv');
const {Blob} = require('buffer');

exports.CrmForm = async (req, res, next) => {

    const activeUsers = await User.find({active: true}).select('name');
    
    res.render('crmForm', {
        languages: [{name: 'Dutch'}, {name: 'German'}, {name: 'English',default: true}, {name: 'French'}, {name: 'Romanian'}, {name: 'Italian'}], 
        sales_reps: activeUsers,
        mtype: ["M1", "M2", "M3", "M4"],
        job_title: ["Owner", "Director", "Retail Manager", "Engineering Manager", "HSSE Manager", "Marketing Manager", "Partner"]
    });
}

exports.getAllContacts = async (req, res, next) => {

    const contacts = await Contact.find().populate('sales_rep').sort({'createdAt': '-1'});

    res.render('contactOverview', {contacts, filters: []})

}

exports.createNewContact = async (req, res) => {

    const formInput = req.body;

    const newContact = {
        name: formInput.name,
        company: formInput.company,
        email: formInput.email,
        phone: formInput.phone,
        street: formInput.street,
        postal: formInput.postal,
        city: formInput.city,
        country: formInput.country,
        language: formInput.language,
        description: formInput.description,
        sales_rep: formInput.sales_rep,
        picture: formInput.picture,
        mtype: formInput.mtype,
        job_title: formInput.job_title
    }

    try {
        const savedOne = await Contact.create(newContact);
        const populatedInfo = await Contact.find(savedOne).populate({path: 'sales_rep', select: 'name email phone picture'});
        // When send_confirmation is true, send mail


        if(req.body.send_confirmation === 'on') {
            const mailOptions = {
                from: populatedInfo[0].sales_rep.email,
                sales_rep: populatedInfo[0].sales_rep,
                user: {
                    email: populatedInfo[0].email,
                    name: populatedInfo[0].name
                },
                delay: 60000
            }

            // 1800000 = 30 minuten
            console.log(`Mail is added to the queue with option ${mailOptions.user.name}`)
            await addMailToQueue(mailOptions);

        }


        req.flash('notification',{status: 'success', message: `The contact ${newContact.name} is saved`})
        
        res.status(200).send({
            status: 200,
            msg: 'Succesfully created a contact',
            connection: true
        })   
    } catch (error) {
        console.log(error.message)
        req.flash('notification',{status: 'error', message: `${error.message}`})

    }
}

exports.exportcontacts = async (req, res, next) => {
    console.log('REQUEST FOR EXPORT', req.session.user.email)
    const emailTo = req.session.user.email;

    const queryParams = ''

    const result = await Contact.find();

    let csvData = [];
    const options = {
        showLabels: true,
        title: `${Date.now()}-allcontacts`,
        // headers: ['_id', 'name', 'email', 'mtype', 'job_title', 'phone', 'company', 'street', 'postal', 'city', 'country', 'description', 'language', 'saels_rep', 'picture']
    }
    for(const contact of result) {
        csvData.push(contact);
    };
    
    console.log(csvData);
    const csvExporter = new ExportToCsv(options);

    const doc = await csvExporter.generateCsv(csvData, true);
    // console.log(doc);
    res.download(doc);

}