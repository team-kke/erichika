"use strict";

var React = require('react/addons');

var InGameNavComponent = React.createClass({
  render: function () {
    var oursClassName = React.addons.classSet({
      'button left': true,
      'current': this.props.side === 'ours'
    });
    var opponentsClassName = React.addons.classSet({
      'button left': true,
      'current': this.props.side === 'opponents'
    });
    return (
      <div className='nav'>
        <a className={oursClassName} href='#'
           onClick={this.switchToOurs}>Ours</a>
        <a className={opponentsClassName} href='#'
           onClick={this.switchToOpponents}>Opponents&rsquo;</a>
        <a className='button left' href='#'>Question</a>
        <a className='button right submit' href='#'>Submit</a>
        <a className='button right console' href='#'
           onClick={this.props.runTest}>Test</a>
      </div>
    );
  },
  switchToOurs: function (e) {
    this.props.switchTeam('ours');
    e.preventDefault();
  },
  switchToOpponents: function (e) {
    this.props.switchTeam('opponents');
    e.preventDefault();
  }
});

module.exports = InGameNavComponent;
