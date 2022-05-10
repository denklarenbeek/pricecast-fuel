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
            console.log('close navbar')
            const value = e.target.dataset.slug
            // console.log(value);
            if(value === '/logout') {
                await logout()
                window.location.href='/login';
                return
            }
            const menu = document.getElementById('navbar-end');
            menu.classList.remove('open');
            window.location.href = `${value}`
        });
    })
}

export function openMobileNavbar (button) {
    if(!button) return

    console.log(button)
    button.addEventListener('click', async (e) => {
        console.log('hi!')
        const menu = document.getElementById('navbar-end');
        menu.classList.add('open');
    })

}

export function closeMobileNavbar (button) {
    if(!button) return
    button.addEventListener('click', () => {
        const menu = document.getElementById('navbar-end');
        menu.classList.remove('open');
    })
}

