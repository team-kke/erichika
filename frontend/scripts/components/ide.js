"use strict";

var ace = require('brace');
require('brace/theme/tomorrow');
require('brace/mode/javascript');

var React = require('react/addons');

var InGameComponent = React.createClass({
  componentDidMount: function () {
    var editor = ace.edit(this.refs.ide.getDOMNode());
    editor.setTheme('ace/theme/tomorrow');
    var session = editor.getSession();
    session.setMode('ace/mode/javascript');
    session.setTabSize(2);
    session.setUseSoftTabs(true);
  },
  render: function () {
    return (
      <div ref='ide' className='ide'>
      </div>
    );
  }
});

module.exports = InGameComponent;
