"use strict";

var React = require('react/addons')
  , Console = require('./console')
  , Ide = require('./ide')
  , InGameChat = require('./in-game-chat')
  , InGameNav = require('./in-game-nav')
  , Team = require('../team');

var // State Enums
  IdeState = 0,
  ConsoleState = 1;

var InGameComponent = React.createClass({
  teams: {ours: new Team(true), opponents: new Team(false)},
  getInitialState: function () {
    return {current: this.teams.ours, areaRight: IdeState};
  },
  render: function () {
    var areaRight;
    var ideButtonText;
    switch (this.state.areaRight) {
    case IdeState:
      areaRight = <Ide code={this.state.current.code}
                       onChange={this.onIdeChange} />;
      ideButtonText = 'Console';
      break;
    case ConsoleState:
      areaRight = <Console code={this.teams.ours.code} />;
      ideButtonText = 'IDE';
      break;
    }


    return (
      <div id='in-game'>
        <div className='content'>
          <InGameNav ideButtonText={ideButtonText}
                     consoleToggler={this.toggleConsole} />
          <div className='area-left'>
            <InGameChat socket={this.props.socket} />
          </div>
          <div className='area-right'>
            {areaRight}
          </div>
        </div>
      </div>
    );
  },
  toggleConsole: function () {
    switch (this.state.areaRight) {
    case IdeState:
      this.setState({areaRight: ConsoleState});
      break;
    case ConsoleState:
      this.setState({areaRight: IdeState});
      break;
    }
  },
  onIdeChange: function (code) {
    this.props.socket.emit('game/code', {code: code});
    this.teams.ours.code = code;
  }
});

module.exports = InGameComponent;
