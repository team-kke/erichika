"use strict";

var React = require('react/addons');

var SigninComponent = React.createClass({
  render: function () {
    return (
      <div id='signin'>
        <h1 className='logo'>ERICHIKA</h1>
        <form action='/login' method='post' className='form-horizontal'>
          <input placeholder='Username (TODO)' type='text' name='username' />
          <button type='submit'>Sign In</button>
        </form>
      </div>
    );
  }
});

module.exports = SigninComponent;
