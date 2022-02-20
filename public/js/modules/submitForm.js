import axios from 'axios';

export function generateReport (form) {
    if(!form) return

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

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
        const {customer, from_date, till_date, benchmark, comparison} = inputData;

        let errors = [];

        // Check if there is an input field starts with product
        const selectedProducts = Object.keys(inputData).filter(input => input.startsWith('product-'));
        if(selectedProducts.length === 0) {
            let errormessage = {
                msg: 'You have to select at least one product',
                field: 'products'
            };
            errors.push(errormessage)
        };

        if(customer === 'empty') {
            let errormessage = {msg: 'Customer field is empty', field: 'customer'}
            errors.push(errormessage);
            console.log('Customer field is empty')
        }
    
        const dateValidation = validateDatesInput(from_date, till_date);

        if(dateValidation) {
            errors.push(dateValidation)
        }

        if(errors.length > 0) {
            errors.forEach(error => {
                // create error span
                const errorSpan = document.createElement('span');
                errorSpan.classList.add('input-error');
                errorSpan.innerHTML = error.msg
                // find the right id element
                const idElement = document.getElementById(error.field);
                // add span element
                idElement.classList.add('error')
                idElement.appendChild(errorSpan);
            })
        } else {
            // AXIOS POST TO BACKEND && ROUTE TO DOCUMENTS PAGE
            try {
                const result = await axios.post(`${window.location.protocol}//${window.location.host}/report`, inputData);
                window.location.href = '/documents'
            
            } catch (error) {
                console.log(error)
            }
        }
        
        // const overlay = document.getElementById('overlay');
        // overlay.classList.add('show');
        console.log('loading.....', inputData, errors)
    });
};

const validateDatesInput = (from_date, till_date) => {

    const fromDate = Date.parse(from_date);
    const tillDate = Date.parse(till_date);
    const periodOfTime = ((tillDate - fromDate) / 7889400000)
    const today = Date.parse(new Date())
    

    if(tillDate < fromDate) {
        console.log('Till Date is before start date')
        return {msg: 'The end date is before start date', field: 'dates'}
        
    } else if (tillDate > today || fromDate > today ) {
        console.log('dates are in the future')
        return {msg: 'The start is date is in the future', field: 'dates'}  
    } else if (tillDate === fromDate) {
        console.log('Start and end date are the same')
        return {msg: 'The selected period has te be at least 1 day', field: 'dates'}  
    } else if (periodOfTime > 3) {
        console.log('Period is longer then 3 months')
        return {msg: 'The report period cannot be longer then 3 months', field: 'dates'}
    // If the date is before 2015 throw a error (2015 = 1420066800000)
    } else if (fromDate < 1420066800000 || tillDate < 1420066800000) {
        console.log('There is no data of that period')
        return {msg: 'There is no data of that period', field: 'dates'}
    }
}