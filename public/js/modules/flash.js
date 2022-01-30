
export function handleFlashMessages() {

    const flashMessages = document.getElementsByClassName('flash');
    for(const message of flashMessages) {
        setTimeout(() => {
            message.remove();
        }, 7500, message);
    }
}