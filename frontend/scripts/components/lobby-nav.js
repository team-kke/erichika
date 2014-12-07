"use strict";

var React = require('react/addons')
  , Queue = require('./queue');

var LobbyNavComponent = React.createClass({
  render: function () {
    return (
      <div className='nav'>
        <Queue socket={this.props.socket} />
        <a className='button right' href='/logout' onClick={this.signout}>
          Sign out
          <form ref='signoutForm' style={{display: 'hidden'}}
                action='/logout' method='post' />
        </a>
      </div>
    );
  },
  signout: function (e) {
    this.refs.signoutForm.getDOMNode().submit();
    e.preventDefault();
  }
});

module.exports = LobbyNavComponent;
