"use strict";

var React = require('react/addons');

var LobbyNavComponent = React.createClass({
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
