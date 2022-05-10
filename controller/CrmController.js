const User = require('../models/User');
const Contact = require('../models/Contact');

exports.CrmForm = async (req, res, next) => {

    const activeUsers = await User.find({active: true}).select('name');
    
    res.render('crmForm', {languages: [{name: 'Dutch'}, {name: 'German'}, {name: 'English', default: true}], sales_reps: activeUsers});
}



exports.createNewContact = async (req, res) => {

    const formInput = req.body;
    console.log(formInput)

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
    }

    try {
        await Contact.create(newContact);
        req.flash('notification',{status: 'success', message: `The contact ${newContact.name} is saved in the DB`})
        
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
    // CREATE A NEW CRM CONTACT

}