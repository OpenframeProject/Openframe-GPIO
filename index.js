/**
 * Openframe plugin which provides a communication channel to the GPIO pins.
 */

// GPIO not available on all devices...
try {
    var gpio = require('onoff').Gpio;
} catch(e) {
    console.error(e);
}

var pjson = require('./package.json'),
    debug = require('debug')('openframe:gpio'),
    extension = module.exports = {};

/**
 * Extension initialization method.
 *
 * Called when the extension (and its dependencies) have been installed.
 *
 * @param  {object} OF An interface provided to extensions giving limitted access to the frame environment
 */
extension.init = function(OF) {
    // do your extension thing
    debug('=======>   Openframe-GPIO initialized!   <=======');
    /**
     * Extensions also have access to the global event system
     */
    var pubsub = OF.getPubsub();

    /**
     * Extensions also have access to the Swagger REST client (https://github.com/swagger-api/swagger-js)
     * See openframe.io/explorer for API docs, or openframe.io/explorer/swagger.json for the swagger definition
     * which shows the available methods as 'operationId'
     */
    var rest = OF.rest;

    if (!gpio) {
        console.error('\n!!!\nGPIO Not available... is this an RPi?\n!!!\n');
        return;
    }

    var button = new gpio(17, 'in', 'both');

    button.watch(function(err, state) {
        if (err) console.log(err);
        console.log(state);
        // pubsub.publish('/openframe-gpio/17', state);
    });

    rest.OpenframeUser.OpenframeUser_prototype_primary_collection({
        id: 'current'
    }).then(function(data) {
        console.log(data);
    });

};
