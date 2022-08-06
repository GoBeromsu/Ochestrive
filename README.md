# Kurento Many2Many demo (2015-12-24)

This demo requires a Linux Ubuntu 14.04 LTS installation. It requires Kurento Media Server 6.x.

Adapted from [explore-kurento-group-call by sainttail](https://github.com/sainttail/explore-kurento-group-call)

---

# Starting the demo
### Dependencies

[npm](https://nodejs.org/en/)

[bower](http://bower.io/#install-bower)

[Kurento Media Server 6.x](http://doc-kurento.readthedocs.org/en/stable/installation_guide.html)

*optional* [https certificates](https://docs.nodejitsu.com/articles/HTTP/servers/how-to-create-a-HTTPS-server) for Google Chrome/Opera

### Installation

Start [Kurento Media Server](http://doc-kurento.readthedocs.org/en/stable/installation_guide.html) on port 8888 (default).

Enter the root folder and run `npm install`

Enter the static folder and run `bower install`

### Test in browser

Start the server in the root folder with `node server`

Visit localhost:8080 in a browser (localhost:8081 with https).

Currently works with Google Chrome, Opera and Firefox.

Can work in Internet Explorer and Safari if you:

* Uncomment the Temasys adapter/kurento-utils in static/index.html
* Comment out the standard adapter/kurento-utils in static/index.html
* Uncomment the Temasys constraints in static/js/index.js
* Comment out the standard constraints in static/js/index.js

Currently doing this will make constraints stop working in Firefox.

Not tested in other browsers.

**NOTE:** If you are using Chrome/Opera, you must either host the server with https enabled or start the browser with the following flags: --unsafely-treat-insecure-origin-as-secure="domainname or IP address" --user-data-dir="/foo". Otherwise you cannot share your camera/microphone.

---

# General

To use the application, go to the location where it's hosted with 2 or more browsers, register with or without a username and then join the same room. If the username browser 1 uses is different from the username in browser 2, you can also invite someone else to the room. If you're not currently in a room when inviting someone, server.js will randomly generate a roomname and invite both users to that room.

When joining a room, give permission to the browser to use the camera/microphone and you should see yourself and everyone else that is sharing their camera in the room.

## Client side (static/js/index.js)

The client side connects to the server upon loading the page via socket.io. After that it sends/receives messages back and forth to perform actions in the application.

**Registering**

When clicking the register button, it registers the name and socket.id to the server. Currently these are two different registries and it only makes use of the socket.id for functions outside of inviting users to rooms.

**Joining room (constraints)**

There are two methods to join a room. When clicking the Join Room button you will enter the room with the entered room name (can be empty as well). When inviting another user while not in a room, the server will generate a random roomname and place both users in that room.

When joining a room, the client will perform two important functions: `onExistingParticipants` to send video, followed by `receiveVideoFrom` for each room participant to receive video.

By default, the client sends the following constraints to the server to start the local video and sending it to the server:

```
var constraints = {
    audio: true,
    video: {
        frameRate: {
            min: 1, ideal: 15, max: 30
        },
        width: {
            min: 32, ideal: 50, max: 320
        },
        height: {
            min: 32, ideal: 50, max: 320
        }
    }
};
```

These constraints can be altered in `onExistingParticipants` if needed. `onExistingParticipants` also contains constraints for the Temasys plugin. More information about that is in the adapter.js portion of this README.

[webrtc-internals](http://stackoverflow.com/questions/24066850/is-there-an-api-for-the-chrome-webrtc-internals-variables-in-javascript) can be used to see if the browser is indeed sending the correct constraints to the server.

`receiveVideoFrom` loops through the participants in the room and creates a `<video>` object for each participant with `createVideoForParticipant`. The server will set the `<video>.src` for each stream with the help of kurento-utils.

**Recording**

When clicking the start/stop recording button, it will send a message to the server to start/stop recording all the streams in the room. The recording is all done server side.

## Server side (server.js)

The server listens to connections with socket.io after node server.js has been executed.

**Server settings**

The settings variable currently contains two values. `WEBSOCKETURL` and `KURENTOURL`. `WEBSOCKETURL` sets where the client will be available. `KURENTOURL` sets where the Kurento Media Server is available. Default settings assume the Kurento Media Server is installed on the same server on the default port (8888).

There are also HTTPS settings available, though they are commented out. To use it, [generate https certificates](https://docs.nodejitsu.com/articles/HTTP/servers/how-to-create-a-HTTPS-server), uncomment the https code and comment out the existing server code above it. Some browsers require HTTPS to turn on the camera/microphone.

**Rooms**

When a client tries to join a room, the server executes two functions: `getRoom(roomName, function (error, room)` followed by `join(socket, room, function (error, user)`.

`getRoom` fetches the room if it already exists. If the room does not yet exists it will create the room. If no roomname has been given (in the instance of one user inviting another user without being in a room), `generateUUID` generates the roomName. Each room has a seperate instance of kurentoClient and a pipeline which is used to send the video. This is the best way to isolate resources. When all participants have left a room, the pipeline gets released to release all media elements.

`join` has several functions. This is where the WebRtcEndPoint is created for the joining user. This is used to send media/SDP back and forth. It also sets the following two settings:

```
outgoingMedia.setMaxVideoRecvBandwidth(100);
outgoingMedia.setMinVideoRecvBandwidth(20);
```

This limits the bandwidth used when in the room. These settings might have to be increased if the quality is deemed to low. Firefox completely ignores these settings.

Everything related to ICE candidates is to start WebRTC communication applying [Trickle ICE](https://tools.ietf.org/html/draft-ietf-mmusic-trickle-ice-02).

Finally, a `RecorderEndpoint` is applied to the WebRtcEndPoint. This allows the server to record the stream.

**Stream quality settings (Bandwidth restrictions)**

There are two locations in server.js where stream quality is set. This is in `join` and `getEndpointForUser` using the following code:

`join`:
```
outgoingMedia.setMaxVideoRecvBandwidth(100);
outgoingMedia.setMinVideoRecvBandwidth(20);
```

`getEndpointForUser`:
```
incomingMedia.setMaxVideoSendBandwidth(100);
incomingMedia.setMinVideoSendBandwidth(20);
```

These values should be increased if quality is deemed too low.

Next to these settings, the client side also sends several constraints regarding resolution/framerate when starting their stream. If no constraints are given the default constraints from kurento-utils are used instead:

`kurento-utils.js`
```
var MEDIA_CONSTRAINTS = {
        audio: true,
        video: {
            width: 640,
            framerate: 15
        }
    };
```

Note that these default constraints will give a "Malformed constraints" error in Google Chrome when using the Temasys adapter/utils.

**Recording**

In `join` a recorderEndpoint is added to each WebRtcEndPoint. These endpoints use the following settings:

```
var recorderParams = {
    mediaProfile: 'MP4',
    uri: "file:///tmp/file"+userSession.id+ ".mp4"
};
```

`MediaElement#setOutputBitrate(outbut_bitrate_in_bps)` can be used to change the bitrate of a recording, though this is still constrained by what is sent to the server.

Recording currently gathers everyone in the room where the Start Recording button is pressed and activates `record()` on all endpoints.

## WebRTC establishment

[This sequence diagram more or less contains the entire WebRTC connection establishing process](https://raw.githubusercontent.com/dragosch/kurento-group-call/master/docs/overview_messages.png?raw=true)

---

# Adapter.js - WebRTC on IE/Safari OR specific resolution/framerate on Firefox/Chrome

There are currently two version available of adapter.js, a required part of kurento-utils:

[Standard adapter.js](https://github.com/webrtc/adapter), generally the latest version of the adapter, which is a shim to insulate apps from spec changes and prefix differences.

[Temasys adapter.js](https://github.com/Temasys/AdapterJS), a modified version of adapter.js which adds WebRTC support to IE and Safari, though it requires refactoring code such as eventlisteners and code that attaches streams to <video> elements. Since it is a modified version, it may also not always have the latest changes. When using the Temasys adapter, a modified version of the kurento-utils.js is needed instead of the standard one.

#### Constraints - Telling the browser to use audio/video and what resolution/framerate to use

To use the camera/microphone of a device, you call `getUserMedia(constraints, successCallback, errorCallback);` For Chrome/Opera, this either must be done on an https address OR Chrome/Opera must be started with the following flag: --unsafely-treat-insecure-origin-as-secure="domainname or IP address" --user-data-dir="/foo". Multiple domains/IP addresses can be used if you seperate them with a comma.

`getUserMedia` is called in kurento-utils.js. The constraints tell the browser whether or not to use audio/video and what the resolution/framerate of the video should be. This is where, currently, the Temasys adapter and the standard adapter differ.

When giving constraints specifically for Firefox, you must use the following format:

```
var constraints = {
    audio: true,
    video: {
        frameRate: {
            min: 1, ideal: 15, max: 30
        },
        width: {
            min: 32, ideal: 50, max: 320
        },
        height: {
            min: 32, ideal: 50, max: 320
        }
    }
};
```

The `ideal` keyword searches for the closest possible acceptable resolution/framerate between the min and max. It is also possible to use the `exact` keyword instead of min/ideal/max if you need a specific width/height/framerate. `exact` will override the other settings. Another important note is that if Firefox deems the combination of resolution/framerate incorrect, it simply will not start the camera.

The standard adapter.js is able to translate this to the deprecated format that Chrome/other browsers use. The Temasys adapter is currently unable to do so and will give a "Malformed constraints" error when trying to use it.

Chrome and other browsers use the following format [which can be generated here](https://src.chromium.org/svn/trunk/src/chrome/test/data/webrtc/manual/constraints.html)

```
var constraints = {
        audio: true,
        video: {
            mandatory: {
                minWidth: 32,
                maxWidth: 320,
                minHeight: 32,
                maxHeight: 320,
                minFrameRate: 1,
                maxFrameRate: 30
            }
        }
    };
```

This format works with the Temasys plugin on all browsers except Firefox. Firefox will ignore these constraints completely.

[webrtc-internals](http://stackoverflow.com/questions/24066850/is-there-an-api-for-the-chrome-webrtc-internals-variables-in-javascript) can be used to see if the browser is indeed sending the correct constraints to the server.

### Server side quality settings

The server.js file contains settings in two location which govern the quality for all browsers except Firefox. **Firefox ignores the following settings.**

```
outgoingMedia.setMaxVideoRecvBandwidth(100);
outgoingMedia.setMinVideoRecvBandwidth(20);
```

and

```
incomingMedia.setMaxVideoSendBandwidth(100);
incomingMedia.setMinVideoSendBandwidth(20);
```

These settings set the minimum and maximum bitrate that can be used when sending video/audio. If these settings are too low the stream might stutter/fall behind for the other user(s). Firefox will send data depending on the upload speed of the Firefox client and (theoretically) lowers its upload rate when someone with a worse connection enters the conference room. We didn't test this.

---

# Changes to kurento-utils to work with Temasys

kurento-utils requires various refactors to work with Temasys as the Temasys plugin does not use standard <video> functions in IE/Safari. There are also some other IE specific changes required:

**Setting local stream:**

https://github.com/Mobilea/kurento-utils-js/blob/master/dist/kurento-utils.js#L256-L262
```
this.showLocalVideo = function () {
    AdapterJS.webRTCReady(function (isUsingPlugin) {
        if (!isUsingPlugin) {
            localVideo = attachMediaStream(localVideo, videoStream);
        }
    });
};
```

When a browser isn't using the Temasys plugin to enable WebRTC, streams must be started at `this.showLocalVideo()`. If it's not done here, specifically Firefox will not start the stream properly. For Internet Explorer/Safari however, it must be started at `pc.onaddstream` otherwise microphone audio won't work:

https://github.com/Mobilea/kurento-utils-js/blob/master/dist/kurento-utils.js#L178-L184
```
pc.onaddstream = function (event) {
    AdapterJS.webRTCReady(function (isUsingPlugin) {
        if (isUsingPlugin) {
            localVideo = attachMediaStream(localVideo, videoStream);
        }
    });
};
```

In both cases `<video> = attachMediaStream(<video>, stream)` must be used to attach the stream to the <video> element. Temasys will translate this for browsers that don't use the plugin to their standard `<video>.src = stream;` `<video>.load();` counterpart.

**Setting remote stream:**

https://github.com/Mobilea/kurento-utils-js/blob/master/dist/kurento-utils.js#L248-L255
```
function setRemoteVideo() {
    if (remoteVideo) {
        var stream = pc.getRemoteStreams()[0];
        var url = stream;
        remoteVideo = attachMediaStream(remoteVideo, stream);
        console.log('Remote URL:', url);
    }
}
```

Again `<video> = attachMediaStream(<video>, stream)` must be used for attaching the stream to the <video> element instead of the standard methods.

**Disposing of streams**

https://github.com/Mobilea/kurento-utils-js/blob/master/dist/kurento-utils.js#L351-L379
```
this.on('_dispose', function () {
    AdapterJS.webRTCReady(function (isUsingPlugin) {
        if (isUsingPlugin) {
            if (localVideo) {
                streamStop(videoStream);
                localVideo = attachMediaStream(localVideo, null);
            }
            if (remoteVideo) {
                remoteVideo = attachMediaStream(remoteVideo, null);
            }
        } else {
            if (localVideo) {
                localVideo.pause();
                localVideo.src = '';
                localVideo.load();
            }
            if (remoteVideo) {
                remoteVideo.pause();
                remoteVideo.src = '';
                remoteVideo.load();
            }
        }
        pc.close();
    });
    self.removeAllListeners();
    if (window.cancelChooseDesktopMedia !== undefined) {
        window.cancelChooseDesktopMedia(guid);
    }
});
```

When disposing a stream using Temasys, you must also seperately stop the videostream element that is added to the peerconnection. For some reason fetching the stream from the peerconnection (pc) and stopping it there does not turn off the webcam. Without the plugin you can call `<video>.load()` after removing the src to turn off the webcam.

**Replacing addEventListener with element.onEventListenerName**

https://github.com/Mobilea/kurento-utils-js/commit/a802220ae37624eb81dae9edda2426f562065d92
```
pc.onsignalingstatechange = function (event) {
    if (this.signalingState === 'stable') {
        while (candidatesQueue.length) {
            var entry = candidatesQueue.shift();
            this.addIceCandidate(entry.candidate, entry.callback, entry.callback);
        }
    }
};

pc.onicecandidate = function (event) {
    var candidate = event.candidate;
    if (EventEmitter.listenerCount(self, 'icecandidate') || EventEmitter.listenerCount(self, 'candidategatheringdone')) {
        if (candidate) {
            self.emit('icecandidate', candidate);
            candidategatheringdone = false;
        } else if (!candidategatheringdone) {
            self.emit('candidategatheringdone');
            candidategatheringdone = true;
        }
    } else if (!candidategatheringdone) {
        candidatesQueueOut.push(candidate);
        if (!candidate)
            candidategatheringdone = true;
    }
};

if (videoStream) {
    videoStream.onended = function (event) {
        streamEndedListener();
    };
    pc.addStream(videoStream);
}

if (audioStream) {
    audioStream.onended = function (event) {
        streamEndedListener();
    };
    pc.addStream(audioStream);
}
```

Internet Explorer doesn't like addEventListener. Currently there are 4 places where it's used and must be replaced with `element.onEventListenerName = function(event){ handler }`

See all commits: https://github.com/Mobilea/kurento-utils-js/commits/master, from Dec 9, 2015 and up

---

# Adding iOS support

iOS support is not available in this version and has only been tested in [a different project](https://github.com/m59peacemaker/kurento-one2many-iOS), however adding it should only require a few steps (requires OSX installation):

* Turn this into a Cordova/Ionic project
* Add the [cordova-plugin-iosrtc plugin](https://github.com/eface2face/cordova-plugin-iosrtc) to the project
* Add the iosrtc-swift-support.js as a hook
* Use Cordova/Ionic to check if user is using iOS, if so, register globals and bind `getUserMedia`:

```
deviceReady().then(function() {
    if (isDevice('iOS')) {
        cordova.plugins.iosrtc.registerGlobals();
        window.getUserMedia = navigator.getUserMedia.bind(navigator);
    }
});
```

* Include the ios-websocket-hack.js in index.html (preferably after checking the user is on iOS as it slows down other devices)
* On receiving a stream, add the following check:

```
if (isDevice('iOS')) {
    options.connectionConstraints = {
        offerToReceiveAudio: true,
        offerToReceiveVideo: true
    };
}
```

**In OSX:**

* npm install xcode -g (globally or locally)
* cordova platform add ios
* cordova run ios --device

---

# Other neat repositories/threads:

The following repositories/threads were found while working on this project that include features not available in this group call project.

## Repositories

[Composite recording/playing](https://github.com/mayos/kurento-tutorial-node)

The above fork of the node tutorials contains the kurento-one2one-composite-record tutorial. This tutorial mixes both streams in a one-to-one call together and plays them in a single video file. It then records said stream and allows the stream to be played back after ending the call.

[One2Many call with iOS support](https://github.com/m59peacemaker/kurento-one2many-iOS)

The one2many node tutorial has been remade into a Cordova project and has been refactored to include iOS support.

## Threads

[Horizontal scaling: using several servers](https://groups.google.com/forum/#!topic/kurento/LzzsoX9BO3M)

This is currently not yet available but this is the Google Groups thread that'll probably receive the update when it's possible.

[Downscaling per user using capsfilters](https://groups.google.com/forum/#!topic/kurento/k76H6ww2ecQ)

This is something that we didn't get around to testing. It should be possible to watch a person's connection speed and use capsfilters to modify the streams sent to that specific user.

[Screensharing](https://groups.google.com/forum/#!searchin/kurento/wowza/kurento/FR5URV5gTrg/pRfYMSfuAgAJ)

Sharing screen instead of webcam.

[Handling Kurento Media Server crashes](https://groups.google.com/forum/#!topic/kurento/4Fhj-0E5ITk)

This should probably be able to fix the Kurento Media Server crash bug?

---
# Known bugs:

**Kurento Media Server crash**

If the Kurento-media-server-6.0 service restarts or crashes during a call and a user tries to join an existing room afterwards, the Kurento Client will try to use the old connection to the media server and will crash server.js.

**Stopping recording**

When a user starts recording and then leaves the room, the recording will still continue for the remaining users unless someone else in the room clicks on Stop Recording

**Single frame video with audio**

When trying to record a file and the file already exists, it sometimes records a video that has 1 frame of video and working audio.

---
