'use strict';

const _ = require('lodash');
const constants = require('../constants');
const utils = require('../utils');
const validate = require('./validate');


const test = (context) => {
  const extraEnv = {
    ZAPIER_BASE_ENDPOINT: constants.BASE_ENDPOINT
  };

  if (global.argOpts.debug) {
    extraEnv.LOG_TO_STDOUT = 'true';
    extraEnv.DETAILED_LOG_TO_STDOUT = 'true';
  }

  if (!utils.isCorrectVersion(context)) {
    process.exitCode = 1;
    return Promise.resolve();
  }

  return validate(context)
    .then(() => utils.readCredentials(undefined, false))
    .then((credentials) => {
      context.line(`Adding ${constants.AUTH_LOCATION} to environment as ZAPIER_DEPLOY_KEY...`);
      extraEnv.ZAPIER_DEPLOY_KEY = credentials.deployKey;
    })
    .then(() => {
      const env = _.extend({}, process.env, extraEnv);
      const commands = ['run', '--silent', 'test'];

      if (global.argOpts.timeout) {
        commands.push('--');
        commands.push(`--timeout=${global.argOpts.timeout}`);
      }

      context.line('Running test suite.');
      return utils.runCommand('npm', commands, {stdio: 'inherit', env})
        .then((stdout) => {
          if (stdout) {
            context.line(stdout);
          }
        });
    });
};
test.argsSpec = [
];
test.argOptsSpec = {
  debug: {flag: true, help: 'print zapier detailed logs to standard out'},
  timeout: {help: 'add a default timeout to mocha, in milliseconds'},
};
test.help = 'Tests your app via `npm test`.';
test.example = 'zapier test';
test.docs = `\
This command is effectively the same as \`npm test\`, except we also validate your app and set up the environment. We recommend using mocha as your testing framework.

**Arguments**

${utils.argsFragment(test.argsSpec)}
${utils.argOptsFragment(test.argOptsSpec)}

${'```'}bash
$ zapier test
#
#   triggers
#     hello world
#       ✓ should load fine (777ms)
#       ✓ should accept parameters (331ms)
#
#   2 passing (817ms)
#
${'```'}
`;

module.exports = test;
