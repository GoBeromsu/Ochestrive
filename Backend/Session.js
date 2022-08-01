export default class UserSession {

    constructor(socket, userName, roomName) {
        this.id = socket.id;
        this.socket = socket;
        this.name = userName;
        this.roomName = roomName;
        this.outgoingMedia = null;
        this.incomingMedia = {};
        this.iceCandidateQueue = {};
    }

    addIceCandidate(data, candidate) {
        // self
        if (data.sender === this.name) {
            // have outgoing media.
            if (this.outgoingMedia) {
                console.log(` add candidate to self : %s`, data.sender);
                this.outgoingMedia.addIceCandidate(candidate);
            } else {
                // save candidate to ice queue.
                console.log(` still does not have outgoing endpoint for ${data.sender}`);
                this.iceCandidateQueue[data.sender].push({
                    data: data,
                    candidate: candidate
                });
            }
        } else {
            // others
            let webRtc = this.incomingMedia[data.sender];
            if (webRtc) {
                console.log(`%s add candidate to from %s`, this.name, data.sender);
                webRtc.addIceCandidate(candidate);
            } else {
                console.log(`${this.name} still does not have endpoint for ${data.sender}`);
                if (!this.iceCandidateQueue[data.sender]) {
                    this.iceCandidateQueue[data.sender] = [];
                }
                this.iceCandidateQueue[data.sender].push({
                    data: data,
                    candidate: candidate
                });
            }
        }
    }

}