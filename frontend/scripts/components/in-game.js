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
  teams: {ours: new Team('ours'), opponents: new Team('opponents')},
  getInitialState: function () {
    return {current: this.teams.ours, areaRight: IdeState};
  },
  componentDidMount: function () {
    this.props.socket.emit('game/didJoin');
    this.props.socket.on('game/update', this.update);
  },
  update: function (data) {
    this.teams.ours.users = data.ours.users;
    this.teams.opponents.users = data.opponents.users;
    this.setState({current: this.teams[this.state.current.name]});
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
            <InGameChat users={this.state.current.users}
                        chatLogs={this.state.current.chatLogs}
                        chatHandler={this.sendChat} />
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
  },
  sendChat: function (text) {
    this.props.socket.emit('game/chat', {text: text});
  }
});

module.exports = InGameComponent;
