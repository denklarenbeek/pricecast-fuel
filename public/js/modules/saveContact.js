import axios from 'axios';

export function saveContact (form) {
    

    if(!form) return

    console.log('inside the function')

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const submitButton = form.querySelector('button[type="submit"]');
        /*
            FORM VALIDATION
                1. Get all the input fields
                2. Check if they are not empty
                3. Check if dates are not in the future
                4. Check if the period is not longer than 3 months
                5. Check if the from date is before the end date
        */

        const data = new FormData(form);
        const inputData = Object.fromEntries(data.entries());
        const {name, language, sales_rep} = inputData;

        // console.log(inputData);

        let errors = [];

        if(!name) {
            errors.push({msg: 'A name is required', field: 'name'})
        }

        if(language === 'empty') inputData.language = undefined
        if(sales_rep === 'empty') inputData.sales_rep = undefined

        if(errors.length > 0) {
            errors.forEach(error => {
                // create error span
                const errorSpan = document.createElement('span');
                errorSpan.classList.add('input-error');
                errorSpan.innerHTML = error.msg
                // find the right id element
                const idElement = document.getElementById(error.field);
                console.log(error.field, idElement);
                // add span element
                idElement.classList.add('error')
                idElement.parentElement.appendChild(errorSpan);
            })
        } else {
            // Set the button to a spinner
            submitButton.innerHTML = '<i class="fas fa-spinner loading-spinner"></i>'
            submitButton.disabled = true;
            // AXIOS POST TO BACKEND && ROUTE TO DOCUMENTS PAGE
            try {
                // SET THE BUTTON TO A LOAD BUTTON
                console.log('loading.....', inputData, errors)
                await axios.post(`${window.location.protocol}//${window.location.host}/uniti-crm`, inputData);
                window.location.href = '/uniti-crm'
            
            } catch (error) {
                submitButton.innerHTML = 'Error'
                console.log(error)
            }
        }
    });
};