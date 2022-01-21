
export function socket () {
    
    const socket = io();

    socket.on('reportdone', (arg) => {
        console.log(arg); // world
    });

};