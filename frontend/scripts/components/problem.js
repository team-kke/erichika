"use strict";

var React = require('react/addons');

var ProblemComponent = React.createClass({
  render: function () {
    if (!this.props.show || !this.props.problem) {
      return null;
    }

    var problem = this.props.problem;

    return (
      <div className='problem'>
        <div className='title'>{problem.title}</div>
        <div className='description'>{problem.description}</div>
      </div>
    );
  }
});

module.exports = ProblemComponent;
