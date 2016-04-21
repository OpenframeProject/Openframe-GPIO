/**
 * Openframe plugin which provides a communication channel to the GPIO pins.
 */

// GPIO not available on all devices...
try {
    var gpio = require('onoff').Gpio;
} catch (e) {
    console.error(e);
}

var pjson = require('./package.json'),
    debug = require('debug')('openframe:gpio'),
    Extension = require('openframe-extension');

/**
 * Extension initialization method.
 *
 * Called when the extension (and its dependencies) have been installed.
 *
 * @param  {object} OF An interface provided to extensions giving limitted access to the frame environment
 */
module.exports = new Extension({
    init: function(OF) {
        // do your extension thing
        debug('=======>   Openframe-GPIO initialized!   <=======');
        /**
         * Extensions also have access to the global event system
         */
        var pubsub = this.pubsub;

        /**
         * Extensions also have access to the Swagger REST client (https://github.com/swagger-api/swagger-js)
         * See openframe.io/explorer for API docs, or openframe.io/explorer/swagger.json for the swagger definition
         * which shows the available methods as 'operationId'
         */
        var rest = this.rest;

        /**
         * Reference to the frame model wrapper, allowing plugin to update frame data.
         * (frame.state is the model data)
         */
        var frame = this.frame;

        if (!gpio) {
            console.error('\n!!!\nGPIO Not available... is this an RPi?\n!!!\n');
            return;
        }

        // using onoff GPIO lib, define pin 17 to be an input
        var button = new gpio(17, 'in', 'both');

        // used to debounce requests... don't make more than one request at a time
        var fetching = false;

        // watch for changes on the button.
        button.watch(function(err, state) {
            if (err) console.log(err);
            console.log(state);
            // we're only interested in when the button is pressed... if it's pressed
            // and we're not already fetching, get a random artwork from the collection
            if (state === 1 && !fetching) {
                getRandomFromCollection();
            }
        });

        /**
         * Use the REST API to fetch the collection, then select a random artwork to display.
         */
        function getRandomFromCollection() {
            fetching = true;
            // get the logged-in user's primary collection
            rest.OpenframeUser.OpenframeUser_prototype_primary_collection({
                id: 'current'
            }).then(function(data) {
                // the list of artwork from the collection
                var artworkList = data.obj.collection.artwork,
                    len = artworkList.length,
                    randomIdx = getRandomInt(0, len - 1),
                    randomArtwork = artworkList[randomIdx];

                debug(randomArtwork);

                // frame.state is the plain JS object representing the frame's state...
                // set the _current_artwork to be the randomArtwork
                frame.state._current_artwork = randomArtwork;

                // then save the frame to the server. when the db is updated on the server, the server
                // will trigger a 'frame updated' event, which will in turn update this frame, forcing
                // the artwork to change to the new one we just set
                frame.save()
                    .then(function() {
                        debug('Success...');
                        fetching = false;
                    })
                    .catch(function(err) {
                        debug('ERROR: ', err);
                    });
            }).catch(function(err) {
                debug('ERROR: ', err);
            });
        }

        // well-named function...
        function getRandomInt(min, max) {
            return Math.floor(Math.random() * (max - min + 1)) + min;
        }
    }
});
