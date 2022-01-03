import axios from 'axios';

export function generateReport (button) {
    if(!button) return

    document.querySelector('form').addEventListener('submit', async (e) => {
        const overlay = document.getElementById('overlay');
        overlay.classList.add('show');
        console.log('loading.....')
    });
};
