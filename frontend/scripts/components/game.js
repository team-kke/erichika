"use strict";

var React = require('react/addons')
  , InGame = require('./in-game')
  , Lobby = require('./lobby')
  , Socket = require('../socket');

var
  GameStateNormal = 0,
  GameStateLobby = 1,
  GameStateInGame = 2;

var GameComponent = React.createClass({
  socket: new Socket(),
  getInitialState: function () {
    return {gameState: GameStateNormal};
  },
  componentDidMount: function () {
    var that = this;
    this.socket.connect();
    this.socket.on('connect', function () {
      that.setState({gameState: GameStateLobby});
    });
  },
  render: function () {
    switch (this.state.gameState) {
    case GameStateNormal:
      return null;
    case GameStateLobby:
      return <Lobby socket={this.socket} />;
    case GameStateInGame:
      return <InGame socket={this.socket} />;
    }
  }
});

module.exports = GameComponent;
