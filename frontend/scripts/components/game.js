"use strict";

var React = require('react/addons')
  , InGame = require('./in-game')
  , Lobby = require('./lobby')
  , Result = require('./result')
  , Socket = require('../socket');

var
  GameStateNormal = 0,
  GameStateLobby = 1,
  GameStateInGame = 2;

var GameComponent = React.createClass({
  socket: new Socket(),
  getInitialState: function () {
    return {gameState: GameStateNormal, showResult: false, win: false};
  },
  componentDidMount: function () {
    var that = this;
    this.socket.connect();
    this.socket.on('connect', function () {
      that.setState({gameState: GameStateLobby});
    });
    this.socket.on('game/join', function () {
      that.setState({gameState: GameStateInGame});
    });
  },
  render: function () {
    switch (this.state.gameState) {
    case GameStateNormal:
      return null;
    case GameStateLobby:
      return (
        <div>
          <Result show={this.state.showResult} win={this.state.win} />
          <Lobby socket={this.socket} />
        </div>
      );
    case GameStateInGame:
      return <InGame socket={this.socket} onResult={this.showGameResult} />;
    }
  },
  showGameResult: function (win) {
    that.setState({
      gameState: GameStateLobby,
      showResult: true,
      win: win
    });
  }
});

module.exports = GameComponent;
