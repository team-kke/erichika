"use strict";

var React = require('react/react-with-addons')
  , Socket = require('./socket');

var App = React.createClass({
  socket: new Socket(),
  componentDidMount: function () {
    this.socket.connect();
    this.socket.on('connect', function () {
      console.log('hello, socket!');
    });
  },
  render: function () {
    return <h1>Hello, world!</h1>;
  }
});

React.render(<App />, document.getElementById('app'));
