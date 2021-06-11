'use strict';

const governify = require('governify-commons');
const logger = governify.getLogger().tag('initialization')

const server = require('./server');

governify.init().then((commonsMiddleware) => {
  server.deploy('prod', commonsMiddleware).catch(logger.error);
});

// quit on ctrl-c when running docker in terminal
process.on('SIGINT', function onSigint () {
  logger.info('Got SIGINT (aka ctrl-c in docker). Graceful shutdown ', new Date().toISOString());
  shutdown();
});

// quit properly on docker stop
process.on('SIGTERM', function onSigterm () {
  logger.info('Got SIGTERM (docker container stop). Graceful shutdown ', new Date().toISOString());
  shutdown();
});

const shutdown = () => {
  server.undeploy();
};
