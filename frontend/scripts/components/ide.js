"use strict";

var ace = require('brace');
require('brace/theme/tomorrow');
require('brace/mode/javascript');

var React = require('react/addons');

var IdeComponent = React.createClass({
  editor: null,
  componentDidMount: function () {
    this.editor = ace.edit(this.refs.ide.getDOMNode());
    this.editor.setTheme('ace/theme/tomorrow');
    this.editor.setReadOnly(this.props.disable);

    var session = this.editor.getSession();
    session.setMode('ace/mode/javascript');
    session.setTabSize(2);
    session.setUseSoftTabs(true);
    session.on('change', this.onChange);
  },
  componentDidUpdate: function () {
    if (this.editor) {
      this.editor.setValue(this.props.code);
      this.editor.clearSelection();
      this.editor.setReadOnly(this.props.disable);
    }
  },
  render: function () {
    return <div ref='ide' className='ide'></div>;
  },
  onChange: function (e) {
    if (!e.bySetValue) {
      this.props.onChange(this.editor.getValue());
    }
  }
});

module.exports = IdeComponent;
