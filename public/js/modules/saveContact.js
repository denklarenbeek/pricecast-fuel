import axios from 'axios';

export function uploadFile (fileInput) {
    if(!fileInput) return


    fileInput.addEventListener('change', async (e) => {

        // console.log('change', fileInput.files[0]);

        let formData = new FormData();
        formData.append('picture', fileInput.files[0]);

        if(fileInput.files[0]) {

            try {
    
                // Set spinner && remove chose file button
                const div = document.getElementById('uploadfile');
                const label = div.getElementsByTagName('label')[0];
                label.innerHTML = 'Uploading picture....'
                fileInput.classList.add('hidden');
                const spinner = document.createElement('p');
                spinner.classList.add('loading');
                spinner.style.width = '50px';
                spinner.style.height = '50px';
                div.appendChild(spinner);
                div.dataset.loading = true
    
                const result = await axios({
                    method: 'post',
                    url: `${window.location.protocol}//${window.location.host}/api/upload`, 
                    data: formData, 
                    headers: {'Content-Type': 'multipart/form-data' }
                });
    
                if(result.data.status === 200) {
                    spinner.remove()
                    const {url} = result.data
                    const image = document.createElement('img');
                    image.src = url;
                    image.style.width = '100%';
                    image.id = 'uploaded-image';
                    image.dataset.url = url
                    label.innerHTML = 'Uploaded picture'
                    div.dataset.loading = false
                    div.appendChild(image);
                }
    
            } catch (error) {
                label.innerHTML = error.message
                console.log(error);
            }
        }
        
    })

}

export function saveContact (form) {
    

    if(!form) return

    console.log('inside the function')

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const uploadingDiv = document.getElementById('uploadfile')
        const label = uploadingDiv.getElementsByTagName('label')[0];

        if(uploadingDiv.dataset.loading === 'true') {
            console.log('still uploading');
            uploadingDiv.scrollIntoView({behavior: "smooth", inline: 'start'});
            label.innerHTML = 'Wait to the upload is completed'
            return
        }

        const submitButton = form.querySelector('button[type="submit"]');

        const data = new FormData(form)
        const inputData = Object.fromEntries(data.entries());
        const {name} = inputData;

        const uploadedImage = document.getElementById('uploaded-image');
        if(uploadedImage) {
            inputData.picture = uploadedImage.dataset.url
        } else {
            inputData.picture = undefined
        }

        let errors = [];

        if(!name) {
            errors.push({msg: 'A name is required', field: 'name'})
            document.getElementById('name').scrollIntoView({behavior: "smooth", inline: 'start'});
        }

        if(errors.length > 0) {
            errors.forEach(error => {
                // create error span
                const errorSpan = document.createElement('span');
                errorSpan.classList.add('input-error');
                errorSpan.innerHTML = error.msg
                // find the right id element
                const idElement = document.getElementById(error.field);
                console.log(error.field, idElement);
                // add span element
                idElement.classList.add('error')
                idElement.parentElement.appendChild(errorSpan);
            })
        } else {
            // Set the button to a spinner
            submitButton.innerHTML = '<i class="fas fa-spinner loading-spinner"></i>'
            submitButton.disabled = true;
            // AXIOS POST TO BACKEND && ROUTE TO DOCUMENTS PAGE
            try {
                // SET THE BUTTON TO A LOAD BUTTON
                const result = await axios({
                    method: 'post',
                    url: `${window.location.protocol}//${window.location.host}/uniti-crm`, 
                    data: inputData
                });
                console.log(result);
                window.location.href = '/uniti-crm'
            
            } catch (error) {
                submitButton.innerHTML = 'Error'
                console.log(error)
            }
        }
    });
};



export function toggleFormInputs (formgroup) {
    console.log(formgroup);
    if(!formgroup) return;

    const containers = document.querySelectorAll('.togglecontainer');

        const clickme = document.getElementById('clickme')

        if(clickme) {
            clickme.addEventListener('click', (e) => {
                const parent = e.target.parentElement.parentElement
                if(parent.classList.contains('hidden')){
                    parent.classList.remove('hidden')
                } else {
                    parent.classList.add('hidden')
                }
            });
        }
}

export function openPicture (button) {
    if(!button) return

    const buttons = document.querySelectorAll('.open-picture');

    buttons.map(btn => {
        btn.addEventListener('click', (e) => {

            const url = btn.dataset.url;
            window.open(url, '_blank').focus();
        })
    });

}


export function handleFilters (filters) {
    if(!filters) return

    const filterButtons = document.querySelectorAll('.filter-button');

    for(const button of filterButtons) {
        button.addEventListener('click', (e) => {

            const targetValue = e.target.value.toLowerCase();

            console.log(targetValue);

            // Check if the category of the filter is already used
            const category = e.target.dataset.category;
            const queryString = window.location.search;
            const urlParams = new URLSearchParams(queryString);

            console.log(queryString);

            // If not add filter to the param

            // If yes, check if filter is already selected then deselect
            // Otherwise, add the filter
        })
    }

}