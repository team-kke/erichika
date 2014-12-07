"use strict";

var React = require('react/addons')
  , frontendRoot = require('../constants').frontendRoot;

var FooterComponent = React.createClass({
  render: function () {
    return (
      <div id='footer'>
        <div className='wrapper'>
          <a href='https://github.com/team-kke' className='text left'>2014</a>
          <a href='https://github.com/team-kke' className='profile'>
            <img src={frontendRoot + '/img/erichika.jpg'} />
          </a>
          <a href='https://github.com/team-kke' className='text right'>KKE</a>
        </div>
      </div>
    );
  }
});

module.exports = FooterComponent;
