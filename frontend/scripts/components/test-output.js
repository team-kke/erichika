"use strict";

var React = require('react/addons');

var TestOutputComponent = React.createClass({
  render: function () {
    if (!this.props.show) {
      return null;
    }

    return (
      <div className='test-output'>
        <a className='close-button' href='#' onClick={this.close}>&times;</a>
        {this.props.code}
      </div>
    );
  },
  close: function (e) {
    this.props.close();
    e.preventDefault();
  }
});

module.exports = TestOutputComponent;
