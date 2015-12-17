/**
 * Openframe plugin which provides a communication channel to the GPIO pins.
 */

try {
    var gpio = require('rpi-gpio');
} catch(e) {
    console.error(e);
}

module.exports = function(pubsub) {
    'use strict';
    if (!gpio) {
        console.error('\n!!!\nGPIO Not available... is this an RPi?\n!!!\n');
        return;
    }
    console.log('loading gpio plugin');

    gpio.on('change', function(channel, value) {
        console.log('Channel ' + channel + ' value is now ' + value);
        pubsub.publish('/openframe-gpio/17', value);
    });

    gpio.setup(17, gpio.DIR_IN, gpio.EDGE_BOTH);

    // gpio.open(17, "input", function(err) {     // Open pin 16 for output
    //     gpio.read(17, function(val) {          // Set pin 16 high (1)
    //         pubsub.publish('/openframe-gpio/17', val);
    //     });
    // });
};