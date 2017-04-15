var protocol = require('./protocol');

// UDP datagram.
var dgram = require('dgram');
const uuid = require('uuid/v1');

if (process.argv.length != 3) {
    console.log('Invalid number of arguments.');
    console.log('Usage: node app.js <instrument name>');

    return;
}

var name = process.argv[2];
var sound = protocol.instruments[name];

if (sound == null) {
    console.log('Instrument not found...');

    return;
}

// Create the IPv4 UDP socket.
var socket = dgram.createSocket('udp4');

// Instrument class.
function Instrument(uuid, sound) {
    this.uuid = uuid;
    this.sound = sound;

    Instrument.prototype.update = function() {
        var payload = new Buffer(JSON.stringify(this));

        socket.send(payload, 0, payload.length, protocol.MULTICAST_PORT, protocol.MULTICAST_ADDRESS, function(err, res) {
            if (err) {
                throw new Error(err);
            }
        });
    };

    setInterval(this.update.bind(this), 1000);
}

instrument = new Instrument(uuid(), sound);
