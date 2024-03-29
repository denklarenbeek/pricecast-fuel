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

export function doubleClicktoDelete (button) {
    if(!button) return

    const rows = document.querySelectorAll('.failed');
    rows.map(row => {
        row.addEventListener('dblclick', async (e) => {
            const id = e.target.dataset.rowid;
            try {
                const response = await axios.delete(`${window.location.protocol}//${window.location.host}/api/report/${id}`);
                const row = document.getElementById(id);
                row.remove();
            } catch (error) {   
            }
        })
    })
}

export function deletePopUp (button) {
    if(!button) return

    const buttons = document.querySelectorAll('.delete-row');

    buttons.map(button => {
        button.addEventListener('click', async (e) => {
            const id = e.target.dataset.reportid
            // create a pop-up, with make sure button
            console.log(id);
            try {
                const response = await axios.delete(`${window.location.protocol}//${window.location.host}/api/report/${id}`);
                console.log(response);
                const rowElement = document.getElementById(id);
                rowElement.remove();
                
            } catch (error) {
                console.log(error)
            }

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
    });

}

export function shareReport (button) {

    if(!button) return

    const sharebuttons = document.querySelectorAll('.sharebutton');
    sharebuttons.map(button => {
        button.addEventListener('click', async (e) => {
            const documentid =  e.target.dataset.reportid
            
            //Open a modal with the possibility to searh for a username
            const overlay = document.getElementById('overlay');

            const container = document.createElement('div');
            container.classList.add('search-user-container');
            container.classList.add('overlay-container');
            const textParagraph = document.createElement('h4');
            textParagraph.innerHTML = 'With who do you want to share this document?'

            const closeContainerButton =  document.createElement('i');
            // closeContainerButton.innerHTML = "X"
            closeContainerButton.classList.add('fas');
            closeContainerButton.classList.add('fa-times');
            closeContainerButton.classList.add('close-button');
            closeContainerButton.addEventListener('click', (e) => {
                container.remove();
                overlay.classList.remove('show');
            });

            const inputDiv = document.createElement('div');
            const selectInput = document.createElement('input');
            selectInput.setAttribute('type', 'text');
            selectInput.setAttribute('id', 'searchUserInput');
            selectInput.setAttribute('name', 'selectsharewith');
            selectInput.setAttribute('placeholder', 'Start typing the name.....')
            inputDiv.appendChild(selectInput);

            const submitShareButton = document.createElement('button');
            submitShareButton.classList.add('btn');
            submitShareButton.style.width = '100px';
            submitShareButton.style.height = '34px';
            submitShareButton.innerHTML = "Share <i class='fas fa-share-alt'></i>"
            submitShareButton.addEventListener('click', async (e) => {
                submitShareButton.innerHTML = '<i class="fas fa-spinner loading-spinner"></i>'
                submitShareButton.disabled = true
                if(selectInput.value.length === 0) {
                    //VALIDATION SPAN!
                    return
                } 
                try {
                    console.log(selectInput.value);
                    const userid = selectInput.dataset.userid
                    const result = await axios.get(`${window.location.protocol}//${window.location.host}/api/sharereport?id=${documentid}&shared=${userid}`);
                    window.location.href = '/documents';

                } catch (error) {
                    
                }
            });

            // Retreive search results based on their name
            selectInput.addEventListener('keyup', async (e) => {
                const searchValue = selectInput.value;

                if(searchValue.length >= 3) {
                    const result = await axios.get(`${window.location.protocol}//${window.location.host}/api/users?q=${searchValue}`);
                    const users = result.data;

                    const containerAlreadyThere = document.querySelector('.search-user-results');
                    if(containerAlreadyThere) {
                        containerAlreadyThere.remove();
                    }

                    const rowContainer = document.createElement('div');
                    rowContainer.classList.add('search-user-results');
                    for(const user of users) {
                        const nameRow = document.createElement('p');
                        nameRow.classList.add('nameRow');
                        nameRow.innerHTML =  user.name
                        nameRow.setAttribute('user', user._id)

                        nameRow.addEventListener('click', (e) => {
                            selectInput.value = user.name;
                            selectInput.dataset.userid = user._id
                            rowContainer.remove();
                        });

                        rowContainer.appendChild(nameRow);
                    }
                    // const searchResult = document.querySelector('.search-user-container');
                    inputDiv.appendChild(rowContainer);
                }

            })

            container.appendChild(closeContainerButton);
            container.appendChild(textParagraph);
            container.appendChild(inputDiv);
            container.appendChild(submitShareButton)

            overlay.classList.add('show');
            overlay.appendChild(container);


        })
    })
}
