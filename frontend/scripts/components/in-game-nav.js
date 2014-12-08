"use strict";

var React = require('react/addons');

var InGameNavComponent = React.createClass({
  render: function () {
    var oursClassName = React.addons.classSet({
      'button left': true,
      'current': this.props.tab === 'ours'
    });
    var opponentsClassName = React.addons.classSet({
      'button left': true,
      'current': this.props.tab === 'opponents'
    });
    var problemClassName = React.addons.classSet({
      'button left': true,
      'current': this.props.tab === 'problem'
    });
    return (
      <div className='nav'>
        <a className={oursClassName} href='#'
           onClick={this.switchToOurs}>Ours</a>
        <a className={opponentsClassName} href='#'
           onClick={this.switchToOpponents}>Opponents&rsquo;</a>
        <a className={problemClassName} href='#'
           onClick={this.showProblem}>Problem</a>
        <a className='button right submit' href='#'>Submit</a>
        <a className='button right console' href='#'
           onClick={this.props.runTest}>Test</a>
      </div>
    );
  },
  switchToOurs: function (e) {
    this.props.switchTo('ours');
    e.preventDefault();
  },
  switchToOpponents: function (e) {
    this.props.switchTo('opponents');
    e.preventDefault();
  },
  showProblem: function (e) {
    this.props.showProblem();
    e.preventDefault();
  }
});

module.exports = InGameNavComponent;
