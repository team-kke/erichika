"use strict";

var React = require('react/react-with-addons');

var App = React.createClass({
  render: function () {
    return <h1>Hello, world!</h1>;
  }
});

React.render(<App />, document.getElementById('app'));
