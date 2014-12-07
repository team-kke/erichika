"use strict";

var React = require('react/addons')
  , Lobby = require('./lobby')
  , Socket = require('../socket');

var GameComponent = React.createClass({
  socket: new Socket(),
  getInitialState: function () {
    return {loadLobby: false};
  },
  componentDidMount: function () {
    var that = this;
    this.socket.connect();
    this.socket.on('connect', function () {
      that.setState({loadLobby: true});
    });
  },
  render: function () {
    if (this.state.loadLobby) {
      return <Lobby socket={this.socket} />
    } else {
      return null;
    }
  }
});

module.exports = GameComponent;
