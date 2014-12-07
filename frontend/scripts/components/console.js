"use strict";

var React = require('react/addons');

var ConsoleComponent = React.createClass({
  render: function () {
    return (
      <div ref='console' className='console'>
        {this.props.code}
      </div>
    );
  }
});

module.exports = ConsoleComponent;
