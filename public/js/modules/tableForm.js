import axios from 'axios';

const createInput = (type, options) => {
    
    const input = document.createElement('input');
    input.setAttribute('type', type)

    if(options.name) {
        input.setAttribute('name', options.name);
    }

    if(options.value) {
        input.setAttribute('value', options.value);   
    }

    if(options.id) {
        input.setAttribute('id', options.id);
    }

    if(options.classnameList) {
        for(const name of options.classnameList) {
            input.classList.add(name)
        }
    }

    if(options.disabled) {
        input.disabled = options.disabled
    }

    if(options.checked) {
        input.checked = options.checked
    }

    console.log(input);
    return input
    
}

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

        const input = createInput('checkbox', {name: `product-${product.id}`, value: `${product.name}`, id: `${product.name}`, classnameList: ['select-input'], checked: false})

        label.appendChild(input);

        selectInput.appendChild(label);

    })

}


export async function loadProducts (productInput) {

    if(!productInput) return

    const customerSelector = document.getElementById('customer-selector');
    customerSelector.addEventListener('change', async (e) => {
        const cid = e.target.value;
        

        // Get the products of the selected CID and filter on pricing enabled
        const {stations} = JSON.parse(window.localStorage.getItem('stations'));
        const relatedStations = stations.filter(station => station.cid === cid && station.properties.propertyMap.pricingEnabled === 'true');  
        
        // Add the related stations to the form as checkboxes
        
        const locationContainer = document.getElementById('location-list');
        locationContainer.innerHTML = '';

        for(const location of relatedStations) {
            const label = document.createElement('label');
            label.classList.add('location')
            label.setAttribute('for', location.name)

            const span = document.createElement('span');
            span.classList.add('location-span');
            span.innerHTML = location.name

            label.appendChild(span);

            const input = createInput('checkbox', {name: `location-${location}`, value: `${location}`, id: `location-${location}`, classnameList: ['location-list-item'], checked: true, disabled: true})
            label.appendChild(input);
            locationContainer.appendChild(label)
        }

        console.log('related stations', relatedStations)

        try {

            const newProducts = relatedStations.map(async station => {
                return await axios.get(`${window.location.protocol}//${window.location.host}/api/station/${station.id}/products`);
            });
            Promise.all(newProducts).then((response) => {
                console.log('products', response);

                let arrProd = []
                response.forEach(station => {
                    const newobj = [...arrProd, ...station.data.products];
                    arrProd = newobj;
                })
                const key = 'id';
                const uniqueProducts = [...new Map(arrProd.map(item => [item[key], item])).values()];

                const filtereduniqueProducts = uniqueProducts.filter(item => item.name.toLowerCase() !== 'totaal' && item.name.toLowerCase() !== 'total')
                insertProducts(filtereduniqueProducts);
            });
        } catch (error) {
            console.log(error);
        }
    })

}