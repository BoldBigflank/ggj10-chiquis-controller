
var players = ["a", "b", "c", "d", "e", "f", "g", "h"];
// 9 players, do 3 connections each
// 27 connections total
var MAX_CONNECTIONS = 3;
var connections = {};

findAvailableConnections = function (originalPlayer) {
    // Returns a list of player names that still have available connections
    var result = [];
    for (var i = 0; i < players.length; i++) {
        var playerName = players[i];
        if (playerName == originalPlayer) continue;
        if (connections[originalPlayer] && connections[originalPlayer].indexOf(playerName) !== -1) continue;
        var playerConnections = connections[playerName] || [];

        if (playerConnections.length >= MAX_CONNECTIONS) {
            continue;
        }
        result.push(playerName);
    }
    return result;
};

for(i = 0; i < players.length; i++) {
    // Go down the list of players
    var playerName = players[i];
    var playerConnections = connections[playerName] || [];
    var availableConnections = findAvailableConnections(playerName);
    var breakCount = 100;
    while (playerConnections.length < MAX_CONNECTIONS && availableConnections.length > 0) {
        // While the player doesn't have enough connections and there are more connections to give,
        // Give the player a connection from the available connections
        var connectionIndex = Math.floor(Math.random() * availableConnections.length);
        playerConnections.push(availableConnections[connectionIndex]);

        var connectionName = availableConnections[connectionIndex];
        if (!connections[connectionName]) connections[connectionName] = [];

        // Pair the two connections, then update the available connections list
        connections[connectionName].push(playerName);
        connections[playerName] = playerConnections;
        availableConnections = findAvailableConnections(playerName);

        // Just in case there's an infinite loop
        if (--breakCount < 0) {
            console.log("breaking out");
            break;
        }
    }
}
    console.log("connections");
    console.log(connections);