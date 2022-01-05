import axios from 'axios';


async function logout () {
    // console.log('logout user')
    await axios.post(`${window.location.protocol}//${window.location.host}/api/auth/logout`, {});
}

export function navigation (button) { 
    if(!button) return
    
    const buttons = document.querySelectorAll('.navbar_button');
    buttons.forEach(button => {
        button.addEventListener('click', async (e) => {
            const value = e.target.dataset.slug
            // console.log(value);
            if(value === '/logout') {
                await logout()
                window.location.href='/login';
                return
            }
            window.location.href = `${value}`
        });
    })
}