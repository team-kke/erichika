"use strict";

var React = require('react/addons');

var FooterComponent = React.createClass({
  render: function () {
    return (
      <div id='footer'>
        <a className='wrapper' href='https://github.com/team-kke'>
          <div className='left'>2014</div>
          <img src='https://avatars2.githubusercontent.com/u/10048536?v=3&s=200' />
          <div className='right'>KKE</div>
        </a>
      </div>
    );
  }
});

module.exports = FooterComponent;
