"use strict";

var React = require('react/addons')
  , ChatRoom = require('./chat-room')
  , LobbyNav = require('./lobby-nav')
  , UserList = require('./user-list');

var LobbyComponent = React.createClass({
  getInitialState: function () {
    return {userList: []};
  },
  componentDidMount: function () {
    var that = this;
    this.props.socket.emit('lobby/connect');
    this.props.socket.propagate('lobby/join');
    this.props.socket.propagate('lobby/leave');
    this.props.socket.on('lobby/userList', function (data) {
      if (that.isMounted()) {
        that.setState({userList: data.userList});
      }
    });
  },
  render: function () {
    return (
      <div id='lobby'>
        <div className='content'>
          <LobbyNav socket={this.props.socket} />
          <div className='area-left'>
            <UserList data={this.state.userList} />
          </div>
          <div className='area-right'>
            <ChatRoom socket={this.props.socket} />
          </div>
        </div>
      </div>
    );
  }
});

module.exports = LobbyComponent;
