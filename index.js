/**
 * Openframe plugin which provides a communication channel to the GPIO pins.
 */

try {
    var gpio = require('onoff').Gpio;
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

    button = new gpio(17, 'in', 'both');

    button.watch(function(err, state) {
        if (err) console.log(err);
        console.log(state);
        pubsub.publish('/openframe-gpio/17', state);
    });
};