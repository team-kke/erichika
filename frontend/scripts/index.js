"use strict";

var React = require('react/addons')
  , Game = require('./components/game')
  , Signin = require('./components/signin')
  , request = require('superagent');

var App = React.createClass({
  getInitialState: function () {
    return {signedIn: false};
  },
  componentDidMount: function () {
    var that = this;
    request
      .get('/login')
      .type('json')
      .end(function (res) {
        if (res.status === 200) {
          that.setState({signedIn: res.body.login});
        }
      });
  },
  render: function () {
    var content;
    if (this.state.signedIn) {
      content = <Game />;
    } else {
      content = <Signin />;
    }

    return (
      <div>
        {content}
      </div>
    );
  }
});

React.render(<App />, document.getElementById('app'));
