"use strict";

var React = require('react/addons')
  , TestOutput = require('./test-output')
  , Ide = require('./ide')
  , InGameChat = require('./in-game-chat')
  , InGameNav = require('./in-game-nav')
  , Team = require('../team')
  , moment = require('moment')
  , request = require('superagent');

var InGameComponent = React.createClass({
  teams: {ours: new Team('ours'), opponents: new Team('opponents')},
  getInitialState: function () {
    return {current: this.teams.ours, showTestOutput: false, testOutput: null};
  },
  componentDidMount: function () {
    this.props.socket.emit('game/didJoin');
    this.props.socket.on('game/update', this.update);
    this.props.socket.on('game/chat', this.updateChat);
  },
  update: function (data) {
    this.teams.ours.users = data.ours.users;
    this.teams.opponents.users = data.opponents.users;
    this.setState({current: this.teams[this.state.current.side]});
  },
  updateChat: function (data) {
    data.chat.datetime = moment().format('h:mm A');
    this.teams[data.side].chatLogs =
      this.teams[data.side].chatLogs.concat([data.chat]);
    if (this.state.current.side === data.side) {
      this.setState({current: this.teams[this.state.current.side]});
    }
  },
  render: function () {
    return (
      <div id='in-game'>
        <div className='content'>
          <InGameNav runTest={this.runTest} />
          <div className='area-left'>
            <InGameChat users={this.state.current.users}
                        chatLogs={this.state.current.chatLogs}
                        chatHandler={this.sendChat} />
          </div>
          <div className='area-right'>
            <Ide code={this.state.current.code} onChange={this.onIdeChange} />
            <TestOutput show={this.state.showTestOutput}
                        output={this.state.testOutput}
                        close={this.closeTest} />
          </div>
        </div>
      </div>
    );
  },
  runTest: function () {
    var that = this;
    request
      .post('/test')
      .send({code: this.teams.ours.code})
      .type('json')
      .end(function (res) {
        if (res.status === 200) {
          that.setState({showTestOutput: true, testOutput: res.body});
        }
      });
  },
  closeTest: function () {
    this.setState({showTestOutput: false});
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
