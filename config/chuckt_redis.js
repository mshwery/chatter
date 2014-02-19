var events = require('events'),
    util = require('util'),
    redis = require('redis');


ChuckT = function (connection, connections, pub) {
    events.EventEmitter.call(this);
    this.conn = connection;
    this.connections = connections;
    this.conn.on('data', function (data) {
        that.process.call(that, data);
    });

    this.id = this.conn.id;

    // Get reference of all client connections
    if (this.connections)
        this.connections[this.conn.id] = {
            conn: this.conn
        };
    var that = this;

    this.conn.on('close', function (data) {
        if (this.sub)
            this.sub.end();
        if (this.connections)
            delete connections[socket.id];
    });

    // To initilize redis connection
    this.initPub = function () {
        this.pub = pub;

        if (pub.auth_pass)
            this.sub = redis.createClient(pub.port, pub.host).auth(pub.auth_pass);
        else
            this.sub = redis.createClient();

        this.sub.on("message", function (channel, message) {
            var parsed = JSON.parse(message);
            if ((parsed.chuckt.id && parsed.chuckt.id != that.conn.id) || !parsed.chuckt.id)
                that.conn.write(message);

        });
    };

     // Emit a event to all clients in a channel except the broadcaster
    this.emitToPeers = function (event) {
        var args = Array.prototype.slice.call(arguments);
        this.emit('emitToPeers', event, args.slice(1));
    };


    // Emit a event to the current clients browser
    this.emitToBrowser = function (event) {
        var args = Array.prototype.slice.call(arguments);
        this.emit('emitToBrowser', event, args.slice(1));
    };

    // Emit a event to all clients browsers
    this.emitToAllBrowsers = function (event) {
        var args = Array.prototype.slice.call(arguments);
        this.emit('emitToAllBrowsers', event, args.slice(1));
    };

    // Emit a event to all clients in a channel
    this.emitToChannel = function (event) {
        var args = Array.prototype.slice.call(arguments);
        this.emit('emitToChannel', event, args.slice(1));
    };

    // Change the Channel/room id of the current user
    this.switchChannel = function (channelName) {

        this.channel = channelName;
        this.sub.unsubscribe();
        this.sub.subscribe(channelName);
    };

    // inherit from EventEmitter; allow access to original emit()
    util.inherits(ChuckT, events.EventEmitter);
    this.$emit = events.EventEmitter.prototype.emit;
    this.on = events.EventEmitter.prototype.on;



    this.emit = function (funcName, event) {
        var args = Array.prototype.slice.call(arguments);
        var params = {
            event: event,
            args: args.slice(2)[0]
        };

        if (funcName == "emitToPeers")
            params.id = this.conn.id;

        var message = this.serialize(params);

        if (funcName == "emitToBrowser")
            this.conn.write(message);

        if (funcName == "emitToAllBrowsers")
            for (key in this.connections) {

                this.connections[key].conn.write(message);
            }

        if (funcName == "emitToChannel" || funcName == "emitToPeers")
            this.pub.publish(this.channel, message);


    };

    /**
     * Serializes the given data into json string with the chuckt prefix
     *
     * Usage:
     *  chuckt.serialize({event:'my-custom-event', args:['foo', 'bar']});
     *  returns: {"chuckt":{"event":"my-custom-event","args":["foo","bar"]}}
     *
     * @param data
     * @return {*}
     */
    this.serialize = function (data) {
        return JSON.stringify({
            chuckt: data
        });
    };

    /**
     * Processes the given message string
     *
     * If the message string is a json encoded containing a property named
     * "chuckt", then the value of that property is processes as a chuckt event.
     *
     * @param message
     */
    this.process = function (message) {
        var parsed = JSON.parse(message);

        // don't handle non-chuckt messages
        if (typeof parsed.chuckt !== 'object') return;
        var chuckt = parsed.chuckt;

        var args = [chuckt.event];
        if (typeof chuckt.args === 'object') {
            for (var i in chuckt.args) {
                args.push(chuckt.args[i]);
            }
        }

        if (typeof chuckt.callbackid !== 'undefined') {
            var conn = this.conn, serialize = this.serialize;
            args.push(function() {
                return conn.write(serialize({
                    callbackid: chuckt.callbackid,
                    args: Array.prototype.slice.call(arguments)
                }));
            });
        }

        this.$emit.apply(this, args);
    };

};
exports.ChuckT = ChuckT;