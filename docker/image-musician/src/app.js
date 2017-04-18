// Import protocol.
var protocol = require('./protocol');

// UDP Datagram sockets.
var dgram = require('dgram');

// Unique ID generator (compliant with RFC4122).
const uuid = require('uuid/v1');

// We check that the correct number of arguments has been specified.
if (process.argv.length != 3) {
    console.log('Invalid number of arguments.');
    console.log('Usage: node app.js <instrument name>');

    return;
}

// Retrieve the instrument name given by the user.
var name = process.argv[2];

// Retrieve the sound of the instrument.
var sound = protocol.instruments[name];

// If it doesn't exist, then we display the error and exit the program.
if (sound == null) {
    console.log('Instrument not found...');

    return;
}

// Create the IPv4 UDP socket.
var socket = dgram.createSocket('udp4');

// Instrument class.
function Instrument(uuid, sound) {
    // Unique identifier.
    this.uuid = uuid;

    // Instrument's sound.
    this.sound = sound;

    Instrument.prototype.update = function() {
        var payload = new Buffer(JSON.stringify(this));

        socket.send(payload, 0, payload.length, protocol.MULTICAST_PORT, protocol.MULTICAST_ADDRESS, function(err, res) {
            if (err) {
                throw new Error(err);
            }
        });
    };

    // Call the `update()` method every second.
    setInterval(this.update.bind(this), 1000);
}

// We create the instrument with a unique identifier and a sound.
instrument = new Instrument(uuid(), sound);
