"use strict";

var React = require('react/addons');

var UserList = React.createClass({
  renderUsers: function () {
    return [
      {username: 'alldne', me: false},
      {username: 'noraesae', me: true},
      {username: 'dogedogedogedoge', me: false},
    ].map(function (user) {
      var classes = React.addons.classSet({
        user: true,
        me: user.me
      });
      return <li className={classes}>{user.username}</li>;
    });
  },
  renderLogs: function () {
    return [
    ].map(function (log) {
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
      <div>
        <ul className='user-list'>
          {this.renderUsers()}
        </ul>
        <div className='chat-room'>
          <ul ref='chatLog' className='log'>
            {this.renderLogs()}
          </ul>
          <input ref='chatInput' className='chat-input' type='text'
                 placeholder='Say hello!' />
        </div>
      </div>
    );
  }
});

module.exports = UserList;
