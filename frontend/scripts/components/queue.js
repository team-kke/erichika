"use strict";

var React = require('react/addons');

var // Queue State Enums
  Normal = 0,
  Queueing = 1,
  Confirmed = 2;

var // Constants
  MaxPlayerCount = 6;

var QueueComponent = React.createClass({
  getInitialState: function () {
    return {queueState: Normal};
  },
  componentDidMount: function () {
    this.props.socket.on('queue/update', this.update);
  },
  render: function () {
    switch (this.state.queueState) {
    case Normal:
      return (
        <a className='button left' href='#' onClick={this.join}>
          Game Start
        </a>
      );
    case Queueing:
      return (
        <a className='button left queue' href='#' onClick={this.exit}>
          <div className='loading'></div>
          <div className='button-text-wrapper'>
            <span className='button-text queueing'>
              Queueing...
              <span ref='queueCount' className='button-text count'></span>
            </span>
            <span className='button-text cancel'>Cancel</span>
          </div>
        </a>
      );
    }
    return null;
  },
  join: function (e) {
    this.setState({queueState: Queueing});
    this.props.socket.emit('queue/join');
    e.preventDefault();
  },
  exit: function (e) {
    this.setState({queueState: Normal});
    this.props.socket.emit('queue/exit');
    e.preventDefault();
  },
  update: function (data) {
    switch (data.state) {
    case 'wait-player':
      if (this.refs.queueCount) {
        var count = this.refs.queueCount.getDOMNode();
        count.innerText = data.current + ' / ' + MaxPlayerCount;
      }
      return;
    case 'wait-confirm':
      // TODO
    }
  }
});

module.exports = QueueComponent;
