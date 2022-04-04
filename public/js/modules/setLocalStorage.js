import axios from 'axios';

async function formatInitialData (data) {

    const {cid, stations} = data;

    // filter out al not active stations
    const filteredData = stations.filter(station => {
        return (cid.indexOf(station.cid) !== -1)
    });

    return {filteredData, cid};
}

async function setInitialData () {
    try {
        const newStations = await axios.get(`${window.location.protocol}//${window.location.host}/api/station`);
        const newProducts = await axios.get(`${window.location.protocol}//${window.location.host}/api/products`);
        console.log('newproducts', newProducts)
        const filteredData = await formatInitialData(newStations.data);
        const stationsObj = {
            created: Date.now(),
            stations: filteredData.filteredData,
            cid: filteredData.cid
        }
        const productsObj = {
            created: Date.now(),
            products: newProducts.data
        }
        const localProductsData = JSON.stringify(productsObj);
        const localStationData = JSON.stringify(stationsObj);
        window.localStorage.setItem('stations', localStationData);
        window.localStorage.setItem('products', localProductsData);
        console.log('received data from API & set localstorage')
        return {stationsObj, productsObj};
        
    } catch (error) {
        console.log(error);
    }
}

async function checkA2iConnection () {
    try {
        const status = await axios.get(`${window.location.protocol}//${window.location.host}/api/connection`);
        const connectionText = document.getElementById('connection-message');
        const connectionIcon = document.getElementById('connection-icon')

        // Add UI message to show connection
        if(status.data.connection && connectionText) {
            connectionText.innerHTML = status.data.msg
            connectionIcon.style.color = 'green'
        } else if(status.data.status === 403 || status.data.status === 407) {
            connectionText.innerHTML = status.data.msg
            connectionIcon.style.color = 'orange'
        }

    } catch (error) {
        console.log(error);
    }
}

export async function initialize (param) { 

    checkA2iConnection();

    let stations;

    if(window.localStorage !== 'undefined' && window.localStorage.getItem('stations')){

        stations = JSON.parse(window.localStorage.getItem('stations'))
        const durationInMinutes = ((Date.now() - stations.created) / (1000*60));

        if(durationInMinutes > (4*60)) {
            stations = await setInitialData()
            console.log('data is 4 hours old, new data will be loaded');
        }
    } else {
        console.log('no localStorage')
        try {             
            const result = await setInitialData();
            stations = result.stationsObj
            console.log('created localstorage')
        } catch (error) {
            console.error(error);
        }
    }

    return stations;

}