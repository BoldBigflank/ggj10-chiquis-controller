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

        var resourceTemplate = '<div class="resource-card <%=type%>" data-id="<%= id %>"><div class="resource-quantity"><%= count %></div></div>';

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
                            return "background-image: url('/img/avatars/" + val.type + ".png');"
                        }
                    }]
                },
                ".ambassador-text": {
                    observe: "messages",
                    onGet: function (val) {
                        if (!val || val.length == 0) return;
                        return val[0].text;
                    }
                },
                ".crisis-text": {
                    observe: "crisis",
                    onGet: function (val) {
                        if (!val || !val.type) return;
                        return "Need " + val.count + " " + val.type
                    }
                },
                ".resource-cards": {
                    observe: "resources",
                    updateMethod: "html",
                    onGet: function (val) {
                        var result = "";
                        for (let i = 0; i < val.length; i++) {
                            result += _.template(resourceTemplate, val[i]);
                        }
                        return result;
                    }
                }
            },

            // View constructor
            initialize: function () {
                this.selectedResource = -1;
                this.radar = [];
                this.model.set({
                    id: this.getUUID(),
                    name: "choose name",

                    // Debug stuff

                    planet: {
                        id: 1234432,
                        x: 150,
                        y: 150,
                        type: "red-circle"
                    },
                    connections: [{
                        id: "1231245",
                        type: "pink-triangle",
                        x: 0,
                        y: 0
                    }, {
                        id: "232332",
                        type: "blue-square",
                        x: 300,
                        y: 0
                    }, {
                        id: "345325",
                        type: "green-donut",
                        x: 150,
                        y: 250
                    }],
                    alert: "We're out of food!",
                    messages: [{
                        emotion: "happy",
                        text: "We're out of food!"
                    }],
                    crisis: {
                        type: "food",
                        count: 1
                    },
                    resources: [{
                        id: 0,
                        type: "medicine",
                        count: 1
                    }, {
                        id: 1,
                        type: "money",
                        count: 2
                    }, {
                        id: 2,
                        type: "oxygen",
                        count: 2
                    }, {
                        id: 3,
                        type: "food",
                        count: 2
                    }]
                });

                // Calls the view's render method
                socket = io.connect();
                socket.on('connect', this.joinGame.bind(this));
                socket.on('player', this.updatePlayer.bind(this));
                this.render();
                this.listenTo(this.model, "change", this.renderRadar, this);
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
                "click .resource-card": "selectResource",
                "click #planet-radar": "clickRadar"
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
                evt.preventDefault();
                $(".resource-card").removeClass("selected");
                $(evt.currentTarget).addClass("selected");
                this.selectedResource = $(evt.currentTarget).data("id");
            },
            clickRadar: function (evt) {
                var canvas = $("#planet-radar")[0];
                var scale = canvas.width / $(canvas).width();
                var x = evt.offsetX * scale;
                var y = evt.offsetY * scale;
                var planet = this.getPlanetAt(x, y);
                if (planet && this.selectedResource != -1) {
                    socket.emit("action", {
                        type: "resource",
                        id: this.model.get("id"),
                        socketId: socket.id,
                        resource: this.selectedResource,
                        planet: planet
                    });
                    this.selectedResource = -1;
                }
            },
            getPlanetAt: function(x, y) {
                for (var i = 0; i < this.radar.length; i++) {
                    if (x > this.radar[i].x - 25 &&
                        x < this.radar[i].x + 25 &&
                        y > this.radar[i].y - 25 &&
                        y < this.radar[i].y + 25 ) return this.radar[i].type;
                }
                return null;
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
                this.radar = [];
                // Clear the canvas
                var canvas = $("#planet-radar")[0];
                var ctx = canvas.getContext("2d");
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                
                // Background image
                // ctx.fillStyle = "black";
                // ctx.fillRect(0, 0, canvas.width, canvas.height);

                // Background circle
                ctx.strokeStyle="white";
                ctx.beginPath();
                ctx.arc(150,150,125, 0,2*Math.PI);
                ctx.stroke();

                // Center planet
                var planet = this.model.get("planet");
                var imageObj = new Image();
                imageObj.onload = function() {
                    ctx.drawImage(imageObj, 125, 125, 50, 50);
                };
                imageObj.src = 'img/planets/' + planet.type +'.png';

                // Perimeter planets
                var connections = this.model.get("connections");
                for (let i = 0; i < connections.length; i++) {
                    const imageObj = new Image();
                    imageObj.onload = function() {
                        ctx.drawImage(imageObj, imageObj.xPos-25, imageObj.yPos-25, 50, 50);
                    };
                    // imageObj.data("x", connections[i].x);
                    // imageObj.data("y", connections[i].y);
                    var normal = {
                        x: connections[i].x - planet.x,
                        y: connections[i].y - planet.y
                    };
                    var len = Math.sqrt(normal.x * normal.x + normal.y * normal.y)
                    normal.x /= len;
                    normal.y /= len;
                    imageObj.xPos = 150 + normal.x * 125;
                    imageObj.yPos = 300 - (150 + normal.y * 125);
                    imageObj.src = 'img/planets/' + connections[i].type + '.png';

                    this.radar.push({
                        type: connections[i].type,
                        x: imageObj.xPos,
                        y: imageObj.yPos
                    });
                }
                
            }
        });

        // Returns the View class
        return View;
    }
);
