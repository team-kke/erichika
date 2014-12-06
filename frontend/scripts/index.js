"use strict";

var React = require('react/react-with-addons')
  , Signin = require('./components/signin')
  , Socket = require('./socket');

var App = React.createClass({
  socket: new Socket(),
  getInitialState: function () {
    // FIXME: check if it's signed in
    return {signedIn: false};
  },
  componentDidMount: function () {
    this.socket.connect();
    this.socket.on('connect', function () {
      console.log('hello, socket!');
    });
  },
  render: function () {
    if (this.state.signedIn) {
      // FIXME: game
      return null;
    } else {
      return <Signin />;
    }
  }
});

React.render(<App />, document.getElementById('app'));
