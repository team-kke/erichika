"use strict";

var React = require('react/addons');

var SigninComponent = React.createClass({
  render: function () {
    return (
      <div id='signin'>
        <h1>hello, world!</h1>
        <button className="btn btn-primary">hi</button>
      </div>
    );
  }
});

module.exports = SigninComponent;
