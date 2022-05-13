const User = require('../models/User');
const Contact = require('../models/Contact');

exports.CrmForm = async (req, res, next) => {

    const activeUsers = await User.find({active: true}).select('name');
    
    res.render('crmForm', {
        languages: [{name: 'Dutch'}, {name: 'German'}, {name: 'English',default: true}, {name: 'French'}, {name: 'Romanian'}, {name: 'Italian'}], 
        sales_reps: activeUsers,
        mtype: ["M1", "M2", "M3", "M4"],
        job_title: ["Owner", "Director", "Retail Manager", "Engineering Manager", "HSSE Manager", "Marketing Manager"]
    });
}

exports.createNewContact = async (req, res) => {

    console.log('hit the route');

    const formInput = req.body;
    console.log(req.body)

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
        console.log(populatedInfo);
        // When send_confirmation is true, send mail
        
        // from: req.body.sales_rep.email,
        // sales_rep: {
        //     name: req.body.sales_rep.name,
        //     phone: req.body.sales_rep.phone,
        //     email: req.body.sales_rep.email,
        //     picture: req.body.sales_rep.picture
        // },
        // user: {
        //     email: req.body.user.email,
        //     name: req.body.user.name
        // },
        // await addMailToQueue()


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

    res.send({msg: "Save a new contact to the DB"})
    // // CREATE A NEW CRM CONTACT

}