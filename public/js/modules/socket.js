
export function socket () {
    
    const socket = io();

    socket.on('report', (arg) => {
        alert(arg); // world
    });

};