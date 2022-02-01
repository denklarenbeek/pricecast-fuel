import axios from 'axios';

export function taskStatus (button) {
    // if(!button) return

    
    document.getElementById('getActiveJobs').addEventListener('click', async (e) => {
        const jobs = await axios.get(`${window.location.protocol}//${window.location.host}/api/tasks`);
        console.log(jobs);
    })

};
