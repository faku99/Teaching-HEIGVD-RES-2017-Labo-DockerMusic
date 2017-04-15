var protocol = require('./protocol');

var dgram = require('dgram');
var moment = require('moment');
var net = require('net');
var _ = require('lodash');

if (process.argv.length != 2) {
    console.log('Invalid number of arguments.');
    console.log('Usage: node app.js');

    return;
}

var socket = dgram.createSocket('udp4');
socket.bind(protocol.MULTICAST_PORT, function() {
    socket.addMembership(protocol.MULTICAST_ADDRESS);
});

var musicians = new Map();

socket.on('message', function(data, source) {
    data = JSON.parse(data);

    var instrument = {
        'uuid': data.uuid,
        'instrument': (_.invert(protocol.instruments))[data.sound],
        'activeSince': moment().toISOString()
    };

    console.log('Received message');

    musicians.set(instrument.uuid, instrument);
});

var server = net.createServer(function(sock) {
    var values = new Array();

    for (var [key, value] of musicians.entries()) {
        if (moment().diff(value.activeSince, 'seconds') > 5) {
            musicians.delete(key);
        } else {
            values.push(value);
        }
    }

    console.log(JSON.stringify(values));
    sock.end(JSON.stringify(values));
});

server.listen(protocol.TCP_PORT, '0.0.0.0');
