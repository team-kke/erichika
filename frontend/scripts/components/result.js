"use strict";

var React = require('react/addons');

var ResultComponent = React.createClass({
  componentDidMount: function () {
    this.update();
  },
  componentDidUpdate: function () {
    this.update();
  },
  update: function () {
    if (this.refs.root) {
      var node = this.refs.root.getDOMNode();
      node.style.display = 'block';
      setTimeout(function () {
        node.style.display = 'none';
      }, 3000);
    }
  },
  render: function () {
    if (!this.props.show) {
      return null;
    }

    if (this.props.win) {
      return (
        <div ref='root' id='result'>
          <div className='result win'>
            <div className='text'>You win!</div>
          </div>
        </div>
      );
    } else {
      return (
        <div ref='root' id='result'>
          <div className='result lose'>
            <div className='text'>You lose...</div>
          </div>
        </div>
      );
    }
  }
});

module.exports = ResultComponent;
