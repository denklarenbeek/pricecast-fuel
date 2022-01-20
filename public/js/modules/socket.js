
export function socket () {
    
    const socket = io();

    socket.on('generatereport', (arg) => {
        console.log(arg); // world
    });

};