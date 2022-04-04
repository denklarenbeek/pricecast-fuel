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
    return input
    
}

function insertProducts (products) {
    const selectInput = document.querySelector('.list');

    selectInput.textContent = ''

    products.forEach(product => {
        const label = document.createElement('label');
        label.classList.add("task");
        console.log(product.name);
        label.setAttribute('for', product.name)

        const span = document.createElement('span');
        span.classList.add('product-name');
        span.innerHTML = `${product.name}`;

        label.appendChild(span);

        const input = createInput('checkbox', {name: `product-${product.productId}`, value: `${product.name}`, id: `${product.name}`, classnameList: ['select-input'], checked: false})

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
        const relatedStations = stations.filter(station => station.cid === cid );  
        
        // Add the related stations to the form as checkboxes
       
        const locationContainer = document.getElementById('location-list');
        locationContainer.innerHTML = '';

        for(const location of relatedStations) {
            const isActive =  (location.properties.propertyMap.pricingEnabled === 'true')

            const label = document.createElement('label');
            label.classList.add('location')
            label.setAttribute('for', `location-${location.id}`)

            const span = document.createElement('span');
            span.classList.add('location-span');
            span.innerHTML = location.name

            label.appendChild(span);

            const input = createInput('checkbox', {name: `location-${location.id}`, value: `${location.name}`, id: `location-${location.id}`, classnameList: ['location-list-item'], checked: isActive})
            label.appendChild(input);
            locationContainer.appendChild(label)
        }

        console.log('related stations', relatedStations)

        const {products} = JSON.parse(window.localStorage.getItem('products'));

        let productsArr = [];

        relatedStations.map(station => {
            const relatedProducts = products.filter(product => product.stationId === station.id);
            productsArr = [...productsArr, ...relatedProducts];
        });

        const x = productsArr.filter((v,i,a)=>a.findIndex(v2=>(v2.productId===v.productId))===i)

        console.log(x);
        insertProducts(x);

        // try {

        //     const newProducts = relatedStations.map(async station => {
        //         return await axios.get(`${window.location.protocol}//${window.location.host}/api/station/${station.id}/products`);
        //     });
        //     Promise.all(newProducts).then((response) => {
        //         console.log('products', response);

        //         let arrProd = []
        //         response.forEach(station => {
        //             const newobj = [...arrProd, ...station.data.products];
        //             arrProd = newobj;
        //         })
        //         const key = 'id';
        //         const uniqueProducts = [...new Map(arrProd.map(item => [item[key], item])).values()];

        //         const filtereduniqueProducts = uniqueProducts.filter(item => item.name.toLowerCase() !== 'totaal' && item.name.toLowerCase() !== 'total')
        //         insertProducts(filtereduniqueProducts);
        //     });
        // } catch (error) {
        //     console.log(error);
        // }
    })

}