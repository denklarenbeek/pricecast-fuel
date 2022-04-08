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

function openProductEditMenu (product, submitText) {

    const overlay = document.getElementById('overlay');
    const body = document.getElementById('body');

    const container = document.createElement('div');
    container.classList.add('overlay-container');

    const form = document.createElement('form');
    form.setAttribute('id', 'editProductForm');

    const productId = createInput('number', {value: product.productId, id: 'productId', name: 'productId'});
    const productIdLabel = createLabel({value: 'Product ID', for: 'productId', class: ['product-input']})
    const productname = createInput('text', {value: product.productname, id: 'name', name: 'name'});    
    const productnameLabel = createLabel({value: 'Product Name', for: 'productname', class: ['product-input']})
    const plu = createInput('number', {value: product.plu, id: 'plu', name: 'plu'});    
    const pluLabel = createLabel({value: 'PLU', for: 'plu', class: ['product-input']})
    const benchmark = createInput('number', {value: product.benchmark, id: 'benchmark', name: 'benchmark'});    
    const benchmarkLabel = createLabel({value: 'Benchmark ID', for: 'benchmark', class: ['product-input']})
    const stationId = createInput('number', {value: product.stationId, id: 'stationId', name: 'stationId'});    
    const stationIdLabel = createLabel({value: 'Station ID', for: 'stationId', class: ['product-input']})
    const stationname = createInput('text', {value: product.stationname, id: 'stationname', name: 'stationname'});
    const stationnameLabel = createLabel({value: 'Station Name', for: 'stationname', class: ['product-input']})

    const closeButton = closeOverlayButton(container);

    const submit = document.createElement('button');
    submit.classList.add('btn');
    submit.innerHTML = submitText

    submit.addEventListener('click', async (e) => {
        e.preventDefault();
        let product = {}
        submit.innerHTML = '<i class="fas fa-spinner loading-spinner"></i>';
        const formData = document.getElementById('editProductForm')

        product.productId = formData.querySelector("[name='productId']").value;
        product.name = formData.querySelector("[name='name']").value
        product.plu = formData.querySelector("[name='plu']").value
        product.benchmark = formData.querySelector("[name='benchmark']").value
        product.stationId = formData.querySelector("[name='stationId']").value
        product.stationName = formData.querySelector("[name='stationname']").value
        
        try {
            const result = await axios.post(`${window.location.protocol}//${window.location.host}/api/products`, [product]);
            window.location.href = '/settings/productmatrix'
        } catch (error) {
            window.location.href = '/settings/productmatrix'
        }

    })
    
    form.appendChild(productIdLabel);
    form.appendChild(productId);
    form.appendChild(productnameLabel);
    form.appendChild(productname);
    form.appendChild(pluLabel);
    form.appendChild(plu);
    form.appendChild(benchmarkLabel);
    form.appendChild(benchmark);
    form.appendChild(stationIdLabel);
    form.appendChild(stationId);
    form.appendChild(stationnameLabel);
    form.appendChild(stationname);
    form.appendChild(submit)
    form.appendChild(closeButton);

    container.appendChild(form);
    overlay.appendChild(container)
    overlay.classList.add('show');
    body.classList.add('overlay-active');
    

}

export function createNewProduct (productbutton) {

    if(!productbutton) return

    const button = document.getElementById('add-product');
    button.addEventListener('click', (e) => {
        openProductEditMenu({}, 'Add new product')
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
            openProductEditMenu(product, 'Change product')

        })
    })

}