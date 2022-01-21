import axios from 'axios';

export function loadDocument (table) {
    if(!table) return

    const tableRows = document.querySelectorAll('.tableClick')
    
    tableRows.map(row => {
        row.addEventListener('click', (e) => {
            if(e.target.dataset.clickable !== 'false') {
                window.location.href = `/documents/${row.dataset.id}`
            }
        })
    })
};


function createPopup (id) {

    const popupContainer = document.createElement('div');
    popupContainer.classList.add('popup-container');
    popupContainer.classList.add('td-action');
    popupContainer.setAttribute('data-clickable', 'false')

    const button = document.createElement('button');
    button.textContent = 'Delete';
    button.setAttribute('class', 'btn btn-danger');
    button.setAttribute('data-clickable', 'false')
    button.setAttribute('data-rowid', `${id}`)
    button.addEventListener('click', async (e) => {
        try {
            console.log(id);
            const response = await axios.delete(`${window.location.protocol}//${window.location.host}/api/report/${id}`);
            console.log(response.data.deleted);
            if(response.data.deleted){
                const row = document.getElementById(id);
                row.parentNode.removeChild(row);
            }
        } catch (error) {   
            console.log(error);
        }
    });

    popupContainer.appendChild(button)

    return popupContainer;
}

export function deletePopUp (button) {
    if(!button) return

    const buttons = document.querySelectorAll('.delete-row');

    buttons.map(button => {
        button.addEventListener('click', (e) => {
            const id = e.target.dataset.rowid
            // create a pop-up, with make sure button
            console.log(id);
            const popup = createPopup(id);
            button.appendChild(popup);

        })
    })

}