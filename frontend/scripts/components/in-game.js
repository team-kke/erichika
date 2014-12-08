"use strict";

var React = require('react/addons')
  , TestOutput = require('./test-output')
  , Ide = require('./ide')
  , InGameChat = require('./in-game-chat')
  , InGameNav = require('./in-game-nav')
  , Problem = require('./problem')
  , Team = require('../team')
  , moment = require('moment')
  , request = require('superagent');

var InGameComponent = React.createClass({
  teams: {ours: new Team('ours'), opponents: new Team('opponents')},
  getInitialState: function () {
    return {
      current: this.teams.ours,
      showTestOutput: false,
      testOutput: null,
      isMyTurn: false,
      showProblem: true,
      problem: null
    };
  },
  componentDidMount: function () {
    this.props.socket.emit('game/didJoin');
    this.props.socket.on('game/update', this.update);
    this.props.socket.on('game/chat', this.updateChat);
    this.props.socket.on('game/code', this.updateCode);
    this.props.socket.on('game/problem', this.updateProblem);
  },
  update: function (data) {
    this.teams.ours.users = data.ours.users;
    this.teams.opponents.users = data.opponents.users;
    this.setState({
      current: this.teams[this.state.current.side],
      isMyTurn: data.ours.users.filter(function (user) {
        return user.me && user.current;
      }).length > 0
    });
  },
  updateChat: function (data) {
    data.chat.datetime = moment().format('h:mm A');
    this.teams[data.side].chatLogs =
      this.teams[data.side].chatLogs.concat([data.chat]);
    if (this.state.current.side === data.side) {
      this.setState({current: this.teams[this.state.current.side]});
    }
  },
  updateCode: function (data) {
    this.teams[data.side].code = data.code;
    if (this.state.current.side === data.side) {
      this.setState({current: this.teams[this.state.current.side]});
    }
  },
  updateProblem: function (data) {
    this.setState({problem: data});
  },
  render: function () {
    var shouldDisableIde = this.state.current.side !== this.teams.ours.side
                           || !this.state.isMyTurn;
    var shouldDisableChat = this.state.current.side !== this.teams.ours.side
                            || this.state.isMyTurn;
    var navTab = this.state.showProblem ? 'problem' : this.state.current.side;

    return (
      <div id='in-game'>
        <div className='content'>
          <InGameNav runTest={this.runTest} tab={navTab}
                     switchTeam={this.switchTeam}
                     showProblem={this.showProblem} />
          <div className='area-left'>
            <InGameChat disable={shouldDisableChat}
                        users={this.state.current.users}
                        chatLogs={this.state.current.chatLogs}
                        chatHandler={this.sendChat} />
          </div>
          <div className='area-right'>
            <Ide disable={shouldDisableIde}
                 code={this.state.current.code} onChange={this.onIdeChange} />
            <TestOutput show={this.state.showTestOutput}
                        output={this.state.testOutput}
                        close={this.closeTest} />
            <Problem show={this.state.showProblem}
                     problem={this.state.problem} />
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
  switchTeam: function (side) {
    this.setState({current: this.teams[side], showProblem: false});
  },
  showProblem: function () {
    this.setState({showProblem: true});
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
