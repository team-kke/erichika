'use strict';

var Sandbox = require('sandbox');

var problems = [
  {
    title: 'Factorial',
    description: "Implement a function, factorial(n), to get !n. An example is like below.<br>\
<pre><code>function factorial(n) {\
  return n * n; // wrong!\
}</code></pre>",
    preparationDuration: 15,
    validations: [
      {call: 'factorial(1)', result: 1},
      {call: 'factorial(5)', result: 120},
      {call: 'factorial(10)', result: 3628800}
    ]
  }
];

exports.getOne = function () {
  // FIXME
  return problems[0];
};

exports.validation = function (problem, code, callback) {
  var validate = function (idx) {
    var validation = problem.validations[idx];
    if (validation) {
      var codeToRun = code + ";\n" + validation.call;
      var sandbox = new Sandbox();
      sandbox.run(codeToRun, function (res) {
        if (validation.result.toString() === res.result) {
          validate(idx + 1);
        } else {
          callback(false);
        }
      });
    } else {
      callback(true);
    }
  };
  validate(0);
};
