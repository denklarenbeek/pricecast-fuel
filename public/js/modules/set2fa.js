import axios from 'axios';

export async function check2fa (button) {
    if(!button) return
    console.log('button is here!');
    const tokenForm = document.getElementById('tokenForm');

    const groupClass = document.createElement('div');
    groupClass.classList.add('form-group');

    const label = document.createElement('label');
    label.setAttribute('for', 'token');
    label.innerHTML = 'Fill in the generated token';

    groupClass.appendChild(label);

    const input = document.createElement('input');
    input.setAttribute('type', 'tel');
    input.setAttribute('name', 'token');
    input.setAttribute('id', 'token');
    input.setAttribute('maxlength', 6);

    groupClass.appendChild(input);

    const submitClass = document.createElement('div');
    submitClass.classList.add('form-group');

    const submitInput = document.createElement('input');
    submitInput.setAttribute('type', 'submit');
    submitInput.setAttribute('value', 'login');
    submitInput.setAttribute('id', 'submit');

    submitClass.appendChild(submitInput);

    const hiddenInput = document.createElement('input');
    hiddenInput.setAttribute('type', 'hidden');
    hiddenInput.setAttribute('id', 'email');
    hiddenInput.setAttribute('name', 'email');

    const form = document.getElementById('loginForm');
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const formData = new FormData(form);

        const user = {
            email: formData.get('email'),
            password: formData.get('password')
        }

        console.log(user);

        try {
            const validPassword = await axios.post(`${window.location.protocol}//${window.location.host}/api/auth/login`, user);
            if(validPassword){
                hiddenInput.setAttribute('value', user.email);
                document.getElementById('loginForm').innerHTML = '';
                tokenForm.appendChild(hiddenInput);
                tokenForm.appendChild(groupClass);
                tokenForm.appendChild(submitClass);
            } else {
                window.location.href = '/login'
            }
        } catch (error) {
            console.error('Hi', error)
            window.location.href = '/login'
        }

    })

};
