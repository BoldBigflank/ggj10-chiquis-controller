// View.js
// -------
define(
    [
        "jquery",
        "backbone",
        "bootstrap",
        "socket.io",
        "models/Model",
        "text!templates/controller.html"
    ],

    function ($, Backbone, bootstrap, io, Model, template) {
        // Socket.io stuff
        var socket;

        var View = Backbone.View.extend({
            // The DOM Element associated with this view
            el: ".example",
            model: new Model(),

            // View constructor
            initialize: function () {
                this.model.set({
                    player: {},
                    playerId: this.getUUID(),
                    game: {}
                });

                // Calls the view's render method
                socket = io.connect();
                socket.on('connect', this.joinGame.bind(this));
                this.render();
            },
            joinGame: function () {
                socket.emit("join", {
                    id: this.model.get("playerId"),
                    socketId: socket.id,
                    room: "controller"
                });
            },
            // View Event Handlers
            events: {
                // "click #resetButton": "triggerReset"
            },
            template: _.template(template, {}),
            // triggerReset: function () {
            //     socket.emit("action", { type: "reset" });
            // },
            getUUID: function () {
                let myStorage = window.localStorage;
                let uuid = parseInt(myStorage.getItem("uuid"));
                if (!uuid) {
                    uuid = Math.floor(Math.random() * 100000);
                    myStorage.setItem("uuid", uuid);
                }
                return uuid;
            },
            // Renders the view's template to the UI
            render: function () {
                // Dynamically updates the UI with the view's template
                this.$el.html(this.template);

                // Maintains chainability
                return this;
            }
        });

        // Returns the View class
        return View;
    }
);
