import axios from 'axios';
import Chart from 'chart.js/auto';

async function getChartData(reportid, stationid, productid) {
    try {
                
        const {data} = await axios.get(`${window.location.protocol}//${window.location.host}/api/report/${reportid}?productid=${productid}&stationid=${stationid}`);
        
        const {datasetprice, datasetlabel, datasetmincompetitorprice, datasetmaxcompetitorprice} = data;

        let chartset;

        if(datasetmincompetitorprice && datasetmaxcompetitorprice) {       
            chartset = [
                {
                    label: 'Price',
                    data: datasetprice,
                    borderColor: 'rgb(75,192,192)',
                    stepped: true,
                },
                {
                    label: 'Max Competitor Price',
                    data: datasetmaxcompetitorprice,
                    borderColor: '#E3E3E3',
                    stepped: true,
                },
                {
                    label: 'Min Competitor Price',
                    data: datasetmincompetitorprice,
                    borderColor: '#E3E3E3',
                    backgroundColor: '#E3E3E3',
                    stepped: true,
                    fill: '-1'
                },
            ]
        } else {
            chartset = [{
                label: 'Price',
                data: datasetprice,
                borderColor: 'rgb(75,192,192)',
                stepped: true,
            }]
        }

        // Initialize Chart!
        const chartData = {
            labels: datasetlabel,
            datasets: chartset
        };

        const config = {
            type: 'line',
            data: chartData,
            options: {}
        }

        
        return config;
        
        
    } catch (error) {
        console.log(error);
    }  
}


export async function generateChart (chart) {
    if(!chart) return

    const buttons = document.querySelectorAll('.btn-graphic');
    buttons.map(button => {
        button.addEventListener('click', async (e) => {
            const id = e.target.id;
            const reportid = e.target.dataset.report;
            const stationid = e.target.dataset.station
            
            const toggleStatus = e.target.classList.contains('open');
            const generateStatus = e.target.dataset.generated;
            
            console.log(toggleStatus, generateStatus)

            const productContainer = document.getElementById(`${reportid}-${stationid}-${id}`);
            
            if(generateStatus === undefined) {

                const chartid = `${reportid}-${Date.now()}`
    
                const canvas = document.createElement('canvas');
                canvas.setAttribute('id', chartid);
    
                productContainer.appendChild(canvas);  
                
                const config = await getChartData(reportid, stationid, id);
                const myChart = new Chart(document.getElementById(chartid), config);

                button.dataset.generated = true;
            }

            productContainer.classList.add('open');
            document.getElementById('chart-modal').classList.add('open');
            // Add the noscroll to the body.
            document.body.classList.add('noscroll');
        })
    })    
};

function removeClasses(modal) {
    // Get a list of all the Charts
    const charts = document.querySelectorAll('.chart');
    for(const chart of charts) {
        // Remove the open class of the Charts
        chart.classList.remove('open');
    };
    // Remove the noscroll attribute on body
    document.body.classList.remove('noscroll');
    // Remove the open class on the .chart-modal
    modal.classList.remove('open');
};


export function closeModal(modal) {
    if(!modal) return

    modal.addEventListener('click', (e) => {
        removeClasses(modal);
    })

    const modalIcon = document.querySelectorAll('.modal-icon');
    for(const icon of modalIcon){
        icon.addEventListener('click', (e) => {
            removeClasses(modal)
        });
    };

}


