// Import protocol.
var protocol = require('./protocol');

// UDP Datagram sockets.
var dgram = require('dgram');

// Moment.js
var moment = require('moment');

// TCP network
var net = require('net');

// Lodash for algorithmic.
var _ = require('lodash');

// We check that the correct number of arguments has been specified.
if (process.argv.length != 2) {
    console.log('Invalid number of arguments.');
    console.log('Usage: node app.js');

    return;
}

// We create an IPv4 UDP socket.
var socket = dgram.createSocket('udp4');
// We bind it to the multicast port and join the multicast group.
socket.bind(protocol.MULTICAST_PORT, function() {
    socket.addMembership(protocol.MULTICAST_ADDRESS);
});

// Map used to store the active musicians,
var musicians = new Map();

// We a message is received over UDP.
socket.on('message', function(data, source) {
    // Parse sent data into a Javascript object.
    data = JSON.parse(data);

    // Declare an instrument with his unique identifier, his name and the last time
    // it was active.
    var instrument = {
        'uuid': data.uuid,
        'instrument': (_.invert(protocol.instruments))[data.sound],
        'activeSince': moment().toISOString()
    };

    // Add the musician to the store.
    musicians.set(instrument.uuid, instrument);
});

// Create a TCP server that sends the list of active musicians when a connection is
// opened.
var server = net.createServer(function(sock) {
    // Array to send.
    var values = new Array();

    // For each musician, we check if it has been active over the last 5 secondes.
    // If not, we remove it from the store.
    for (var [key, value] of musicians.entries()) {
        // Check the difference between actual time and the last moment the musician
        // was active.
        if (moment().diff(value.activeSince, 'seconds') > 5) {
            musicians.delete(key);
        } else {
            // We add the infos to the array.
            values.push(value);
        }
    }

    // Send the array and close the connection right after.
    sock.end(JSON.stringify(values));
});

// Bind server on the TCP port and address defined by the protocol.
server.listen(protocol.TCP_PORT, protocol.TCP_ADDRESS);
