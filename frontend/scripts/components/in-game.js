"use strict";

var React = require('react/addons')
  , Ide = require('./ide')
  , InGameChat = require('./in-game-chat')
  , InGameNav = require('./in-game-nav');

var InGameComponent = React.createClass({
  render: function () {
    return (
      <div id='in-game'>
        <div className='content'>
          <InGameNav socket={this.props.socket} />
          <div className='area-left'>
            <InGameChat socket={this.props.socket} />
          </div>
          <div className='area-right'>
            <Ide socket={this.props.socket} />
          </div>
        </div>
      </div>
    );
  }
});

module.exports = InGameComponent;
