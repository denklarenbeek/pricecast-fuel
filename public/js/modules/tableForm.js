import axios from 'axios';


function insertProducts (products) {
    const selectInput = document.querySelector('.list');

    selectInput.textContent = ''

    products.forEach(product => {
        const label = document.createElement('label');
        label.classList.add("task");
        label.setAttribute('for', product.name)

        const span = document.createElement('span');
        span.classList.add('product-name');
        span.innerHTML = `${product.name}`;

        label.appendChild(span);

        const input = document.createElement('input');
        input.setAttribute('type', 'checkbox')
        input.setAttribute('name', `product-${product.id}`);
        input.setAttribute('value', `${product.name}`);
        input.setAttribute('id', `${product.name}`);
        input.classList.add('select-input')

        label.appendChild(input);

        selectInput.appendChild(label);

    })

}


export async function loadProducts (productInput) {

    if(!productInput) return

    const customerSelector = document.getElementById('customer-selector');
    customerSelector.addEventListener('change', async (e) => {
        const cid = e.target.value;
        

        // Get the products of the selected CID
        const {stations} = JSON.parse(window.localStorage.getItem('stations'));
        const relatedStations = stations.filter(station => station.cid === cid);        

        try {

            const newProducts = relatedStations.map(async station => {
                return await axios.get(`${window.location.protocol}//${window.location.host}/api/station/${station.id}/products`);
            });
            Promise.all(newProducts).then((response) => {
                let arrProd = []
                response.forEach(station => {
                    const newobj = [...arrProd, ...station.data.products];
                    arrProd = newobj;
                })
                const key = 'id';
                const uniqueProducts = [...new Map(arrProd.map(item => [item[key], item])).values()];

                insertProducts(uniqueProducts);

                // Set the productions into the select options
            });
        } catch (error) {
            console.log(error);
        }
    })

}