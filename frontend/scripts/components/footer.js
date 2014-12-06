"use strict";

var React = require('react/addons');

var FooterComponent = React.createClass({
  render: function () {
    return (
      <div id='footer'>
        <div className='wrapper'>
          <a href='https://github.com/team-kke' className='text left'>2014</a>
          <a href='https://github.com/team-kke' className='profile'>
            <img src='https://avatars2.githubusercontent.com/u/10048536?v=3&s=200' />
          </a>
          <a href='https://github.com/team-kke' className='text right'>KKE</a>
        </div>
      </div>
    );
  }
});

module.exports = FooterComponent;
