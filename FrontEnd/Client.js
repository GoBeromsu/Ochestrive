var socket = io();
var participants = {};
var name;

socket.on('connect', () => {
    console.log('ws connect success')
});

socket.on('message', message => {
    console.log('Recieved message')

    switch (message) {

    }
})