const socket = io();
const participants = {};

const Name = document.getElementById("Name");
const nameForm = Name.querySelector('form');
const Session = document.getElementById("Session");
const sessionForm = Session.querySelector("form");
socket.on('connect', () => {
    console.log('Client : ws connection successed')

});

socket.on('message', message => {


    switch (message.id) {
        case "registered":
            console.log(
                'Client Recieved Message : ' + message.data
            )
            break
    }
})

function register(event) {
    event.preventDefault();

    var message = {
        id: 'register',
        name: nameForm.querySelector("input").value,
    }

    sendMessage(message)
}




function sendMessage(message) {
    var jsonMessage = JSON.stringify(message);
    console.log('Client :  ' + jsonMessage);
    socket.emit('message', jsonMessage);
}



// Btn && EventListener

nameForm.addEventListener('submit', register)
// sessionForm.addEventListener("submit", register);