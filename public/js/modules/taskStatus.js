import axios from 'axios';

function createNewJobRow (item) {
    const itemRow = document.createElement('div');
    itemRow.classList.add('jobs-item-row');

    const itemName = document.createElement('p');
    itemName.classList.add('jobs-item-row-name');

    if(item.data.form) {
        itemName.innerHTML = item.data.form.customer
    } else {
        itemName.innerHTML = Date.now().toString();
    }

    const itemDate = document.createElement('p');
    itemDate.innerHTML = new Date (item.timestamp);

    // const itemRemove = document.createElement('p');
    // const removeIcon = document.createElement('i');
    // removeIcon.classList.add('fa');
    // removeIcon.classList.add('fa-trash');
    // removeIcon.setAttribute('id', item.id);

    // itemRemove.classList.add('jobs-item-row-remove');

    // itemRemove.appendChild(removeIcon);

    itemRow.appendChild(itemName);
    itemRow.appendChild(itemDate);
    // itemRow.appendChild(itemRemove);
    return itemRow
}

export function taskStatus (button) {
    if(!button) return
    
    const jobContainer = document.getElementById('jobsContainer');

    document.getElementById('getActiveJobs').addEventListener('click', async (e) => {
        try {
            const result = await axios.get(`${window.location.protocol}//${window.location.host}/api/queue/jobs?status=active`);
            const jobs = result.data;
            for(const job of jobs) {
                const newJob = createNewJobRow(job);
                jobContainer.appendChild(newJob);
            }

            if(jobs > 0) {
                const clearqueueButton = document.createElement('button');
                clearqueueButton.classList.add('btn')
                clearqueueButton.innerHTML = 'clear jobs';
                clearqueueButton.addEventListener('click', async (e) => {
                    clearqueueButton.innerHTML = '<i class="fas fa-spinner loading-spinner"></i>'
                    const result = await axios.delete(`${window.location.protocol}//${window.location.host}/api/queue/clean`);
                    if(result.data.status === 'success') {
                        clearqueueButton.remove()
                    } else if (result.data.status === 'error') {
                        clearqueueButton.innerHTML = 'ERROR'
                        clearqueueButton.classList.add('error')
                        clearqueueButton.disabled = true;
                    }
                })            
                jobContainer.appendChild(clearqueueButton);
            } else {
                const textP = document.createElement('p');
                textP.innerHTML = 'No active jobs';
                jobContainer.appendChild(textP);
            }

        } catch(e) {
            console.log(e)
        }
    })

};
