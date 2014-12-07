"use strict";

var React = require('react/addons');

var // Queue State Enums
  Normal = 0,
  Queueing = 1,
  WaitingConfirm = 2,
  Confirmed = 3;

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
              <span ref='queueCount' className='marg-l3'></span>
            </span>
            <span className='button-text cancel'>Cancel</span>
          </div>
        </a>
      );
    case WaitingConfirm:
      return (
        <div>
          <a className='button left text' href='#'>
            <span>Be ready...</span>
            <span ref='queueCount' className='marg-l3'></span>
          </a>
          <a className='button left confirm' href='#' onClick={this.confirm}>
            <div className='check'>✓</div>
            <div className='button-text-wrapper'>
              <span className='button-text'>
                I&rsquo;m ready!
              </span>
            </div>
          </a>
          <a className='button left dodge' href='#' onClick={this.dodge}>
            No
          </a>
        </div>
      );
    case Confirmed:
      return (
        <div>
          <a className='button left confirmed' href='#'>
            <div className='check'>✓</div>
            <div className='button-text-wrapper'>
              <span>I&rsquo;m ready!</span>
              <span ref='queueCount' className='marg-l3'></span>
            </div>
          </a>
          <a className='button left dodge' href='#' onClick={this.dodge}>
            No
          </a>
        </div>
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
      if (this.state.queueState !== Queueing) {
        this.setState({queueState: Queueing});
      }
      break;
    case 'wait-confirm':
      if (this.state.queueState !== WaitingConfirm &&
          this.state.queueState !== Confirmed) {
        this.setState({queueState: WaitingConfirm});
      }
      break;
    }

    if (this.refs.queueCount) {
      var count = this.refs.queueCount.getDOMNode();
      count.innerText = data.current + ' / ' + MaxPlayerCount;
      count.textContent = data.current + ' / ' + MaxPlayerCount;
    }
  },
  confirm: function (e) {
    this.setState({queueState: Confirmed});
    this.props.socket.emit('queue/confirm');
    e.preventDefault();
  },
  dodge: function (e) {
    this.setState({queueState: Queueing});
    this.props.socket.emit('queue/dodge');
    e.preventDefault();
  }
});

module.exports = QueueComponent;
