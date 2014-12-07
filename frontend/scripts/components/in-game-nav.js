"use strict";

var React = require('react/addons');

var InGameNavComponent = React.createClass({
  render: function () {
    return (
      <div className='nav'>
        <a className='button left' href='#'>Ours</a>
        <a className='button left' href='#'>Opponents&rsquo;</a>
        <a className='button left' href='#'>Question</a>
        <a className='button right submit' href='#'>Submit</a>
        <a className='button right console' href='#'
           onClick={this.props.runTest}>Test</a>
      </div>
    );
  }
});

module.exports = InGameNavComponent;
