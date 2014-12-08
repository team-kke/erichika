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
    var submitClassName = React.addons.classSet({
      'button right submit': true,
      'disable': this.props.disableSubmit
    });
    return (
      <div className='nav'>
        <a className={oursClassName} href='#'
           onClick={this.switchToOurs}>Ours</a>
        <a className={opponentsClassName} href='#'
           onClick={this.switchToOpponents}>Opponents&rsquo;</a>
        <a className={problemClassName} href='#'
           onClick={this.showProblem}>Problem</a>
        <a className={submitClassName} href='#' onClick={this.submit}>
           <span className='text'>Submit</span>
           <span className='cant'>Can&rsquo;t</span>
        </a>
        <a className='button right console' href='#'
           onClick={this.runTest}>Test</a>
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
  },
  runTest: function (e) {
    this.props.runTest();
    e.preventDefault();
  },
  submit: function (e) {
    if (!this.props.disableSubmit) {
      this.props.submit();
    }
    e.preventDefault();
  }
});

module.exports = InGameNavComponent;
