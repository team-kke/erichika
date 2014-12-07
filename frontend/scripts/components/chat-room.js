"use strict";

var React = require('react/addons')
  , moment = require('moment');

var ChatRoomComponent = React.createClass({
  getInitialState: function () {
    return {chatLogs: []};
  },
  componentDidMount: function () {
    var that = this;
    this.props.socket.on('lobby/chat', function (data) {
      data.datetime = moment().format('h:mm A');
      that.setState({chatLogs: that.state.chatLogs.concat([data])});
    });
    this.refs.chatInput.getDOMNode().focus();
  },
  componentDidUpdate: function () {
    var log = this.refs.chatLog.getDOMNode();
    log.scrollTop = log.scrollHeight;
  },
  send: function (e) {
    if (e.keyCode === 13) {
      var text = e.target.value;
      if (text) {
        this.props.socket.emit('lobby/chat', {text: text});
        e.target.value = '';
      }
    }
  },
  renderLogs: function () {
    return this.state.chatLogs.map(function (log) {
      return (
        <li className={log.me ? 'me' : ''}>
          <div className='info'>
            <span className='username'>{log.username}</span>
            <span className='datetime'>{log.datetime}</span>
          </div>
          <div className='text'>{log.text}</div>
        </li>
      );
    });
  },
  render: function () {
    return (
      <div className='chat-room'>
        <ul ref='chatLog' className='log'>
          {this.renderLogs()}
        </ul>
        <input ref='chatInput' className='chat-input' type='text'
               placeholder='Say hello!' onKeyUp={this.send} />
      </div>
    );
  }
});

module.exports = ChatRoomComponent;
