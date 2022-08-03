const socket = io();
const participants = {};

const Name = document.getElementById("Name");
const nameForm = Name.querySelector('form');
const Session = document.getElementById("Session");
const sessionForm = Session.querySelector("form");
socket.on('connect', () => {
    console.log('Web Socket connection success')

});

// socket.on('message', message => {
//     console.log('Recieved message')

//     switch (message) {

//     }
// })



// User 등록하는 함수
async function register(event) {
    event.preventDefault();
    const name = nameForm.querySelector("input").value;
    const session = sessionForm.querySelector("input").value;

    var message = {
        id: 'register',
        name: name,
        session: session
    }

    sendMessage(message);
}


function sendMessage(message) {
    var jsonMessage = JSON.stringify(message);
    console.log('Client :  ' + jsonMessage);
    socket.emit('message', jsonMessage);
}



// Btn && EventListener

sessionForm.addEventListener("submit", register);