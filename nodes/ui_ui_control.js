module.exports = function(RED) {
    var ui = require('../ui')(RED);

    function UiControlNode(config) {
        RED.nodes.createNode(this, config);
        this.events = config.events || "all";
        var node = this;

        this.on('input', function(msg) {
            if (typeof msg.payload !== "object") { msg.payload = {tab:msg.payload}; }
            // show/hide or enable/disable tabs
            if (msg.payload.hasOwnProperty("tabs")) {
                ui.emit('ui-control', {tabs:msg.payload.tabs, socketid:msg.socketid});
            }
            // switch to tab name (or number)
            if (msg.payload.hasOwnProperty("tab")) {
                ui.emit('ui-control', {tab:msg.payload.tab, socketid:msg.socketid});
            }
            // show or hide ui groups
            if (msg.payload.hasOwnProperty("group")) {
                ui.emit('ui-control', {group:msg.payload.group, socketid:msg.socketid});
            }
        });

        var sendconnect = function(id, ip) {
            node.send({payload:"connect", socketid:id, socketip:ip});
        };

        var sendlost = function(id, ip) {
            node.send({payload:"lost", socketid:id, socketip:ip});
        };

        var sendchange = function(index, name, id, ip, p) {
            node.send({payload:"change", tab:index, name:name, socketid:id, socketip:ip, params:p});
        }

        ui.ev.on('newsocket', sendconnect);
        if (node.events === "all") {
            ui.ev.on('endsocket', sendlost);
            ui.ev.on('changetab', sendchange);
        }

        this.on('close', function() {
            ui.ev.removeListener('newsocket', sendconnect);
            if (node.events === "all") {
                ui.ev.removeListener('endsocket', sendlost);
                ui.ev.removeListener('changetab', sendchange);
            }
        })
    }
    RED.nodes.registerType("ui_ui_control", UiControlNode);
};
