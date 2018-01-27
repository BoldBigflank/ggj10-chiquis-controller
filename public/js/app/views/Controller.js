// View.js
// -------
define(
    [
        "jquery",
        "backbone",
        "backbone.stickit",
        "bootstrap",
        "socket.io",
        "models/Model",
        "text!templates/controller.html"
    ],

    function ($, Backbone, Stickit, bootstrap, io, Model, template) {
        // Socket.io stuff
        var socket;

        var View = Backbone.View.extend({
            // The DOM Element associated with this view
            el: ".example",
            model: new Model(),
            bindings: {
                "#player-name": "name",
                ".ambassador-avatar": {
                    attributes: [{
                        name: "style",
                        observe: "planet",
                        onGet: function (val) {
                            console.log("val", val);
                            return "background-image: url('/img/" + val.avatar + ".png');"
                        }
                    }]
                },
                ".ambassador-text": {
                    observe: "messages",
                    onGet: function (val) {
                        if (!val || val.length == 0) return;
                        return val[0].text;
                    }
                }
            },

            // View constructor
            initialize: function () {
                this.model.set({
                    id: this.getUUID(),
                    name: "choose name",

                    // Debug stuff
                    planet: {
                        location: {
                            x: 150,
                            y: 150
                        },
                        avatar: "circle"
                    },
                    messages: [{
                        emotion: "happy",
                        text: "Hello!"
                    }]
                });

                // Calls the view's render method
                socket = io.connect();
                socket.on('connect', this.joinGame.bind(this));
                socket.on('player', this.updatePlayer.bind(this));
                this.render();
            },
            joinGame: function () {
                socket.emit("join", {
                    id: this.model.get("id"),
                    socketId: socket.id,
                    room: "controller"
                });
            },
            updatePlayer: function (data) {
                this.model.set(data);
                this.renderRadar();
            },
            // View Event Handlers
            events: {
                // "click #resetButton": "triggerReset"
                "click .player-name": "changeName",
                "click .resource-card": "selectResource"
            },
            template: _.template(template, {}),
            // triggerReset: function () {
            //     socket.emit("action", { type: "reset" });
            // },
            changeName: function () {
                var name = prompt("What is your name?");
                if (name) {
                    // $("#player-name").html(name);
                    socket.emit("action", {
                        id: this.model.get("id"),
                        name: name
                    });
                }
            },
            selectResource: function (evt) {
                console.log("selected resource");
                evt.preventDefault();
                $(".resource-card").removeClass("selected");
                $(evt.currentTarget).addClass("selected");
            },
            getUUID: function () {
                let myStorage = window.localStorage;
                let uuid = parseInt(myStorage.getItem("uuid"));
                if (!uuid) {
                    uuid = Math.floor(Math.random() * 1000000);
                    myStorage.setItem("uuid", uuid);
                }
                return uuid;
            },
            // Renders the view's template to the UI
            render: function () {
                // Dynamically updates the UI with the view's template
                this.$el.html(this.template);
                this.stickit();
                this.renderRadar();

                // Maintains chainability
                return this;
            },
            renderRadar: function () {
                // Clear the canvas
                var canvas = $("#planet-radar")[0];
                var ctx = canvas.getContext("2d");
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                
                // Background image

                // Background circle
                ctx.beginPath();
                ctx.arc(150,150,125, 0,2*Math.PI);
                ctx.stroke();

                // Center planet
                var imageObj = new Image();
                imageObj.onload = function() {
                    ctx.drawImage(imageObj, 125, 125, 50, 50);
                };
                imageObj.src = 'img/icon.png';

                // Perimeter planets

                
            }
        });

        // Returns the View class
        return View;
    }
);
