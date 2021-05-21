const http = require('http');
const socketio = require('socket.io');
const _ = require('lodash');
const fs = require('fs');

// sets up a simple http server which returns `index.html` for any route
const server = http.createServer(function (req, res) {  
  fs.readFile('./index.html', 'utf-8', (err, html) => {
    if (err) html = String(err);
    res.writeHead(200, {'Content-Type': 'text/html'});
    res.write(html)
    res.end();
  });
});

// setup signaling server
signalServerInit(server);

// start server on designated port
const port = 7777;
server.listen(port);
console.log(`server running at http://localhost:${port}/`)

// sets up a peerstack-compatible signaling server utilizing Google's publicly available STUN servers
function signalServerInit(server) {
  const iceServers = [
    {
      urls: [
        "stun:stun.l.google.com:19302",
        "stun:stun1.l.google.com:19302",
        "stun:stun2.l.google.com:19302",
        "stun:stun3.l.google.com:19302",
        "stun:stun4.l.google.com:19302",
      ],
    }
  ];

  let deviceSocket = {};
  let devices = [];

  function onSocketConnection(socket) {
    const socketId = socket.id;
    let deviceId;
    let user;

    console.log('client connected', socketId);

    socket.on('disconnect', () => {
      console.log('client disconnected', socketId);
      devices = devices.filter(d => d.deviceId != deviceId);
      delete deviceSocket[deviceId];
    });

    socket.on('getIceServers', async (na, callback) => {
      try {
        callback(null, iceServers);
      } catch (err) {
        console.error('getIceServers failed', err);
        callback('getIceServers failed: ' + String(err))
      }
    })

    socket.on('get-available-devices', async (na, callback) => {
      try {
        const myDevice = devices.find(device => device.deviceId == deviceId);
        // any devices that have at least one of my groups
        let availableDevices = devices.filter(device => {
          if (device.deviceId == deviceId) return false;
          return device.groups && device.groups.some(groupId => myDevice.groups.includes(groupId))
        });
        availableDevices = _.uniq(availableDevices).reverse(); // reverse so newest first
        callback(null, availableDevices);
      } catch (err) {
        console.error('getAvailableDevices failed', err);
        callback('getAvailableDevices failed: ' + String(err))
      }
    })

    socket.on('register-device', async (registration, callback) => {
      try {
        user = registration.user;
        deviceSocket[registration.deviceId] = socket;
        deviceId = registration.deviceId
        devices = devices.filter(d => d.deviceId != deviceId);
        devices.push(registration);
        console.log('device registered', deviceId);
        if (callback) callback(null, 'success');
      } catch (err) {
        console.error('device registration failed', err);
        if (callback) callback('device registration failed: ' + String(err))
        return;
      }
    })

    socket.on('offer', (offer) => {
      try {
        offer.user = user;
        deviceSocket[offer.toDevice].emit('offer', offer);
      } catch (err) {
        console.error('offer failed', err);
      }
    })

    socket.on('answer', (answer) => {
      try {
        answer.user = user;
        deviceSocket[answer.toDevice].emit('answer', answer);
      } catch (err) {
        console.error('offer failed', err);
      }
    })

    socket.on('iceCandidate', (iceCandidate) => {
      try {
        deviceSocket[iceCandidate.toDevice].emit('iceCandidate', iceCandidate);
      } catch (err) {
        console.error('iceCandidate failed', err);
      }
    })
  }

  const io = socketio(server);
  io.on('connection', onSocketConnection);
}
