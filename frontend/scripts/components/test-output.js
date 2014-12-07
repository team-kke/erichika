"use strict";

var React = require('react/addons');

var TestOutputComponent = React.createClass({
  render: function () {
    if (!this.props.show) {
      return null;
    }

    var result = null;
    if (this.props.output && this.props.output.result) {
      result = <div className='result'>{this.props.output.result}</div>;
    }

    var consoles = null;
    if (this.props.output && this.props.output.console) {
      consoles = this.props.output.console.map(function (message) {
        return <div className='result'>{message}</div>
      });
    }

    return (
      <div className='test-output'>
        <a className='close-button' href='#' onClick={this.close}>&times;</a>
        <div className='hint-title'>Hint 1</div>
        <div className='hint'>Please use <code>console.log</code>!</div>
        <div className='hint-title'>Hint 2</div>
        <div className='hint'>The last expression will be returned as a result!</div>

        <div className='line' />
        {consoles.length > 0 ? <div className='title'>Console:</div> : null}
        {consoles}
        <div className='title'>Result:</div>
        {result}
      </div>
    );
  },
  close: function (e) {
    this.props.close();
    e.preventDefault();
  }
});

module.exports = TestOutputComponent;
