import axios from 'axios';
import {createInput, createLabel, closeOverlayButton} from './tableForm';

function createNewJobRow (item) {
    const itemRow = document.createElement('div');
    itemRow.classList.add('jobs-item-row');

    const itemName = document.createElement('p');
    itemName.classList.add('jobs-item-row-name');

    if(item.data.form) {
        itemName.innerHTML = item.data.form.customer
    } else {
        itemName.innerHTML = Date.now().toString();
    }

    const itemDate = document.createElement('p');
    itemDate.innerHTML = new Date (item.timestamp);

    itemRow.appendChild(itemName);
    itemRow.appendChild(itemDate);
    
    return itemRow
}

export function taskStatus (button) {
    if(!button) return
    
    const jobContainer = document.getElementById('jobsContainer');

    document.getElementById('getActiveJobs').addEventListener('click', async (e) => {
        try {
            const result = await axios.get(`${window.location.protocol}//${window.location.host}/api/queue/jobs?status=active`);
            const jobs = result.data;
            for(const job of jobs) {
                const newJob = createNewJobRow(job);
                jobContainer.appendChild(newJob);
            }

            if(jobs > 0) {
                const clearqueueButton = document.createElement('button');
                clearqueueButton.classList.add('btn')
                clearqueueButton.innerHTML = 'clear jobs';
                clearqueueButton.addEventListener('click', async (e) => {
                    clearqueueButton.innerHTML = '<i class="fas fa-spinner loading-spinner"></i>'
                    const result = await axios.delete(`${window.location.protocol}//${window.location.host}/api/queue/clean`);
                    if(result.data.status === 'success') {
                        clearqueueButton.remove()
                    } else if (result.data.status === 'error') {
                        clearqueueButton.innerHTML = 'ERROR'
                        clearqueueButton.classList.add('error')
                        clearqueueButton.disabled = true;
                    }
                })            
                jobContainer.appendChild(clearqueueButton);
            } else {
                const textP = document.createElement('p');
                textP.innerHTML = 'No active jobs';
                jobContainer.appendChild(textP);
            }

        } catch(e) {
            console.log(e)
        }
    })

};
// form id
// button text
// Fields []
// inputFields = ['productId', 'productname', 'plu', 'benchmark', 'stationId', 'stationname']
// DATA
// API
// Callback url
function openProductEditMenu (formId, inputFields, api, submitText, callback_url) {

    const overlay = document.getElementById('overlay');
    const body = document.getElementById('body');

    const container = document.createElement('div');
    container.classList.add('overlay-container');

    const form = document.createElement('form');
    form.setAttribute('id', formId);

    for(const input of inputFields) {
    
        const inputEl = createInput(input.type, {value: input.value, id: input.id, name: input.name});
        const label = createLabel({value: input.name, for: input.id, class: input.class})
        
        form.appendChild(label);
        form.appendChild(inputEl);
    }

    const closeButton = closeOverlayButton(container);

    const submit = document.createElement('button');
    submit.classList.add('btn');
    submit.innerHTML = submitText

    submit.addEventListener('click', async (e) => {
        e.preventDefault();
        let item = {}
        submit.innerHTML = '<i class="fas fa-spinner loading-spinner"></i>';
        const formData = document.getElementById(formId)

        for (const input of inputFields) {
            item[input.name] = formData.querySelector(`[name='${input.name}']`).value;
        }

        try {
            const result = await axios.post(`${window.location.protocol}//${window.location.host}/api/${api}`, [item]);
            window.location.href = callback_url
        } catch (error) {
            window.location.href = callback_url
        }

    })
    
    form.appendChild(submit)
    form.appendChild(closeButton);

    container.appendChild(form);
    overlay.appendChild(container)
    overlay.classList.add('show');
    body.classList.add('overlay-active');

}

export function createNewCustomer (customerbutton) {

    if(!customerbutton) return

    const button = document.getElementById('add-customer');
    button.addEventListener('click', (e) => {
        openProductEditMenu('editCustomerForm', [
            {type: 'number',id: 'cid', name: 'cid', value:'' , class: ['product-input']},
            {type: 'text',id: 'name', name: 'name', value:'' , class: ['product-input']},
            {type: 'text',id: 'picture', name: 'picture', value:'' , class: ['product-input']},
        ], 'customers', 'Add new customer', '/settings/customers')
    })

}

export function createNewProduct (productbutton) {

    if(!productbutton) return

    const button = document.getElementById('add-product');
    button.addEventListener('click', (e) => {
        openProductEditMenu('editProductForm', [
            {type: 'number',id: 'productId', name: 'productId', value:'' , class: ['product-input']},
            {type: 'text',id: 'name', name: 'name', value:'' , class: ['product-input']},
            {type: 'number',id: 'plu', name: 'plu', value:'' , class: ['product-input']},
            {type: 'number',id: 'benchmark', name: 'benchmark', value:'' , class: ['product-input']},
            {type: 'number', id: 'stationId', name: 'stationId', value:'' , class: ['product-input']},
            {type: 'text', id: 'stationname', name: 'stationname', value:'' , class: ['product-input']}
        ], 'products', 'Add new product', '/settings/productmatrix')
    })
}

export function editProduct (productbutton) {
    if(!productbutton) return
    console.log('hi there')
    const buttons = document.querySelectorAll('.product-edit');
    buttons.map(button => {
        button.addEventListener('click', (e) => {
            let product = {}
            const id = e.target.dataset.databaseid;
            const element = document.querySelector(`[data-databaseid='${id}']`);
            product.productId = element.querySelector("[data-productid]").innerHTML;
            product.productname = element.querySelector("[data-name]").innerHTML
            product.plu = element.querySelector("[data-plu]").innerHTML
            product.benchmark = element.querySelector("[data-benchmark]").innerHTML
            product.stationId = element.querySelector("[data-stationId]").innerHTML
            product.stationname = element.querySelector("[data-stationname]").innerHTML
            console.log(product);
            openProductEditMenu('editProductForm', [
                {type: 'number',id: 'productId', name: 'productId', value: product.productId , class: ['product-input']},
                {type: 'text',id: 'name', name: 'name', value: product.productname , class: ['product-input']},
                {type: 'number',id: 'plu', name: 'plu', value: product.plu , class: ['product-input']},
                {type: 'number',id: 'benchmark', name: 'benchmark', value: product.benchmark , class: ['product-input']},
                {type: 'number', id: 'stationId', name: 'stationId', value: product.stationId , class: ['product-input']},
                {type: 'text', id: 'stationname', name: 'stationname', value: product.stationname , class: ['product-input']}
            ], 'products', 'Change product', '/settings/productmatrix')

        })
    })

}