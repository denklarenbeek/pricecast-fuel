import axios from 'axios';

export function homeTools (home) {
    if(!home) return

    const tools = document.querySelectorAll('.tool');
    for(const tool of tools) {
        if(!tool.classList.contains('under-development')) {
            tool.addEventListener('click', (e) => {
                const slug = e.target.dataset.slug;
                window.location.href = slug
            })
        }
    }
}