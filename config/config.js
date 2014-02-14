/*jshint laxcomma:true*/

var path = require('path')
  , rootPath = path.normalize(__dirname + '/..');

module.exports = {
  development: {
    db: 'mongodb://localhost/chat-dev',
    root: rootPath,
    app: {
      name: 'jabberbox - Development'
    }
  },
  test: {
    db: 'mongodb://localhost/chat-test',
    root: rootPath,
    app: {
      name: 'jabberbox - Test'
    }
  },
  production: {
    db: 'mongodb://localhost/chat',
    root: rootPath,
    app: {
      name: 'jabberbox - Production'
    }
  }
};
