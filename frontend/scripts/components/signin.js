"use strict";

var React = require('react/addons');

var SigninComponent = React.createClass({
  render: function () {
    return (
      <div id='signin'>
        <h1 className='logo'>ERICHIKA</h1>
        <form action='/login' method='post' autoComplete='off'
              onSubmit={this.onSubmit}>
          <input ref='username' className='text text-lg marg-r1'
                 placeholder='Username' type='text' name='username' />
          <button className='btn btn-lg' type='submit'>Sign In</button>
        </form>
      </div>
    );
  },
  onSubmit: function (e) {
    if (!this.refs.username.getDOMNode().value) {
      e.preventDefault();
    }
  }
});

module.exports = SigninComponent;
