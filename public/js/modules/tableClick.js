import axios from 'axios';

export function showdropdown (table) {
    if(!table) return

    const dropdownItems = document.querySelectorAll('.td-action .dropdown-icon');
    
    
    for(const item of dropdownItems) {
        item.addEventListener('click', (e) => {
            const id = e.target.parentNode.dataset.rowid
            const dropdownMenu = document.querySelector(`[data-dropdownid="${id}"]`);
            dropdownMenu.classList.add('open')
        })
    }
   
    const tdActionRows = document.querySelectorAll('.td-action')
    for(const row of tdActionRows) {
        row.addEventListener('mouseleave', (e) => {
            const id = e.target.dataset.rowid
            const dropdownMenu = document.querySelector(`[data-dropdownid="${id}"]`);
            if(dropdownMenu) {
                dropdownMenu.classList.remove('open')
            }
        })
    }

    const editItems = document.querySelectorAll('.edit-item');
    for(const item of editItems) {
        item.addEventListener('click', (e) => {
            const id = e.target.parentNode.dataset.dropdownid;
            console.log(id);
            const row = document.getElementById(id);
            const inputTd = row.querySelector('[data-table-entity="id"]');
            const textNode = inputTd.firstChild();
            console.log(textNode)
            const input = inputTd.lastElementChild();
            input.classList.add('open');
        })
    }
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

export function pagination (page) {

    if(!page) return

    const paginationButtons = document.querySelectorAll('.page');

    paginationButtons.map(button => {
        button.addEventListener('click', (e) => {
            console.log(e.target.dataset.pagenumber);
            window.location.href = `/documents?page=${e.target.dataset.pagenumber}`
        });
    })

}
