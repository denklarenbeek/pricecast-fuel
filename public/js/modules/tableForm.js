
export function createLabel (options) {

    const label = document.createElement('label');
    label.setAttribute('for', options.for);
    label.innerHTML = options.value;

    if(options.class) {
        for(const classname of options.class) {
            label.classList.add(classname);
        }
    }
    
    return label

}

export function closeOverlayButton (container) {
    const overlay = document.getElementById('overlay')
    const body = document.getElementById('body');

    const closeContainerButton =  document.createElement('i');
    closeContainerButton.classList.add('fas');
    closeContainerButton.classList.add('fa-times');
    closeContainerButton.classList.add('close-button');
    closeContainerButton.addEventListener('click', (e) => {
        container.remove();
        overlay.classList.remove('show');
        body.classList.remove('overlay-active')
    });

    return closeContainerButton
}

export function createInput (type, options) {
    
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

            const pricing = document.createElement('i');
            pricing.classList.add('fas');
            pricing.classList.add('fa-euro-sign');

            const span = document.createElement('span');
            span.classList.add('location-span');
            span.innerHTML = location.name

            
            const input = createInput('checkbox', {name: `location-${location.id}`, value: `${location.name}`, id: `location-${location.id}`, classnameList: ['location-list-item'], checked: isActive})
            label.appendChild(input);
            label.appendChild(span);
            if(isActive) {
                label.appendChild(pricing);
            }
            locationContainer.appendChild(label)
        }

        const {products} = JSON.parse(window.localStorage.getItem('products'));

        let productsArr = [];

        relatedStations.map(station => {
            const relatedProducts = products.filter(product => product.stationId === station.id);
            productsArr = [...productsArr, ...relatedProducts];
        });

        const x = productsArr.filter((v,i,a)=>a.findIndex(v2=>(v2.productId===v.productId))===i)
        insertProducts(x);
    })

}