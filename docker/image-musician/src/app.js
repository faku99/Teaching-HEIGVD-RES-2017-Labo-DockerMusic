var protocol = require('./protocol');

// UDP datagram.
var dgram = require('dgram');

if(process.argv.length != 3) {
    console.log('Invalid number of arguments.');
    console.log('Usage: node app.js <instrument name>');

    return;
}

var name = process.argv[2];
var instrument = protocol.instruments[name];

if(instrument == null) {
    console.log('Instrument not found...');

    return;
}

// Create the IPv4 UDP socket.
var socket = dgram.createSocket('udp4');

// Instrument class.
function Instrument(name, sound) {
    this.name = name;
    this.sound = sound;

    Instrument.prototype.update = function() {
        var message = {
            "name": this.name,
            "sound": this.sound
        };
        var payload = new Buffer(JSON.stringify(message));


        socket.send(payload, 0, payload.length, protocol.PORT, protocol.ADDRESS, function(err, res) {
            if(err) {
                throw new Error(err);
            }

            console.log('Sent: ' + payload);
        });
    };

    setInterval(this.update.bind(this), 1000);
}

instrument = new Instrument(name, instrument.sound);
