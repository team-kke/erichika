"use strict";

var React = require('react/addons')
  , Socket = require('../socket');

var GameComponent = React.createClass({
  socket: new Socket(),
  componentDidMount: function () {
    this.socket.connect();
    this.socket.on('connect', function () {
      console.log('hello, socket!');
    });
  },
  render: function () {
    return (
      <div>
        hello!
      </div>
    );
  }
});

module.exports = GameComponent;
