export function socket () {
    
    const socket = io();

    socket.on('connect', () => {
        console.log('connected......')
    })

    socket.on('reportstatus', (response) => {
        const {jobId, status, data} = response
        /*
            1.  Check which page the user is on
            2a. If user is on documents page find the DOM element by the id given
                - Add the new table row information
            2b. If use is on a other page, inform that the document is ready  
        */
        // console.log(jobId, status, data);

        //Job finished successfully
        console.log(status, jobId);
        if(status === 'completed') {

            if(window.location.href.indexOf("documents") > -1) {
                const tableRow = document.getElementById(jobId);
                document.location.reload();
            } else {
                const flashContainer = document.getElementById('flash-messages');
                const messageText = `Your report for <a href='/documents/${jobId}' style='color: white'>${data.customer}</a> is done`
                const message = createFlashmessage('success', messageText);
                flashContainer.appendChild(message);
            }
        } else if (status === 'error') {
            const messageText = `Something went wrong creating your report ${data}`
            createFlashmessage('error', messageText)
        }

    });
};

function createFlashmessage (status, text) {
    const flashDiv = document.createElement('div');
    flashDiv.classList.add('flash');
    flashDiv.classList.add(`flash--${status}`);

    const flashText = document.createElement('p');
    flashText.classList.add('flash__text')
    flashText.innerHTML = text;

    const flashButton = document.createElement('button');
    flashButton.classList.add('flash__remove')
    flashButton.innerHTML = '&times';
    flashButton.onclick = function() {this.parentElement.remove()};

    flashDiv.appendChild(flashText);
    flashDiv.appendChild(flashButton);
    return flashDiv
}