"use strict";

var React = require('react/addons');

var LobbyNavComponent = React.createClass({
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
      <div className='nav'>
        <a className='button left' href='#' onClick={this.gameStart}>
          Game Start
        </a>
        <a className='button right' href='/logout' onClick={this.signout}>
          Sign out
          <form ref='signoutForm' style={{display: 'hidden'}}
                action='/logout' method='post' />
        </a>
      </div>
    );
  },
  gameStart: function (e) {
    this.props.socket.emit('queue/join');
    e.preventDefault();
  },
  signout: function (e) {
    this.refs.signoutForm.getDOMNode().submit();
    e.preventDefault();
  }
});

module.exports = LobbyNavComponent;
