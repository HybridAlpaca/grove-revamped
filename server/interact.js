'use strict';

module.exports = (io) => {
    io.on('connection', function(socket) {
        console.log('SOCKET: A user connected.');
        socket.on('save', (data) => {
            console.log(`SOCKET: ${data.username} saved with ${data}`);
        });
    });
};
