'use strict';

module.exports = {
  server: {
    host: 'localhost',
    port: 8088
  },
  database: {
  	host: '127.0.0.1',
    port: 27017,
    db: 'pollingData',
    username: '',
    password: '',
    url : 'mongodb://localhost'
  },
  mail:{
    user:'email',
    pass: 'password'
  }
};
