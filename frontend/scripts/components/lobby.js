"use strict";

var React = require('react/addons')
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
      that.setState({userList: data.userList});
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
            <h1>hello</h1>
          </div>
        </div>
      </div>
    );
  }
});

module.exports = LobbyComponent;
