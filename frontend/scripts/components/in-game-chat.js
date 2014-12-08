"use strict";

var React = require('react/addons');

var UserList = React.createClass({
  componentDidUpdate: function () {
    var log = this.refs.chatLog.getDOMNode();
    log.scrollTop = log.scrollHeight;
  },
  renderUsers: function () {
    return this.props.users.map(function (user) {
      var classes = React.addons.classSet({
        user: true,
        me: user.me,
        current: user.current
      });
      return <li className={classes}>{user.username}</li>;
    });
  },
  renderLogs: function () {
    return this.props.chatLogs.map(function (log) {
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
    var placeholderText = this.props.disable ? "You can't chat now!"
                                             : "Say hello!";
    return (
      <div>
        <ul className='user-list'>
          {this.renderUsers()}
        </ul>
        <div className='chat-room'>
          <ul ref='chatLog' className='log'>
            {this.renderLogs()}
          </ul>
          <input ref='chatInput' className='chat-input' type='text'
                 placeholder={placeholderText} onKeyUp={this.onKeyUp}
                 disabled={this.props.disable} />
        </div>
      </div>
    );
  },
  onKeyUp: function (e) {
    if (e.keyCode === 13) {
      var text = e.target.value;
      if (text) {
        this.props.chatHandler(text);
        e.target.value = '';
      }
    }
  }
});

module.exports = UserList;
