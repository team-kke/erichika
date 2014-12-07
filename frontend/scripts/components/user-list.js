"use strict";

var React = require('react/addons');

var UserList = React.createClass({
  render: function () {
    var list = this.props.data.map(function (user) {
      var classes = React.addons.classSet({
        user: true,
        me: user.me
      });
      return <li className={classes}>{user.username}</li>;
    });

    return (
      <ul className='user-list'>
        {list}
      </ul>
    );
  }
});

module.exports = UserList;
