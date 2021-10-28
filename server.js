'use strict';

const { logger } = require('oas-tools/src/configurations');

const deploy = (env, commonsMiddleware) => {
  return new Promise((resolve, reject) => {
    try {
      const fs = require('fs');
      const http = require('http');
      const path = require('path');
      const governify = require('governify-commons');
      const logger = governify.getLogger().tag('initialization');
      const express = require('express');
      const app = express();
      app.use(commonsMiddleware);
      const bodyParser = require('body-parser');
      app.use(bodyParser.json({
        strict: false
      }));
      const oasTools = require('oas-tools');
      const jsyaml = require('js-yaml');
      const serverPort = process.env.PORT || 5501;

      const spec = fs.readFileSync(path.join(__dirname, '/api/oas-doc.yaml'), 'utf8');
      const oasDoc = jsyaml.safeLoad(spec);

      const optionsObject = {
        controllers: path.join(__dirname, './controllers'),
        loglevel: env === 'test' ? 'error' : 'info',
        strict: false,
        router: true,
        validator: true
      };

      oasTools.configure(optionsObject);
      oasTools.initialize(oasDoc, app, function () {
        http.createServer(app).listen(serverPort, function () {
          if (env !== 'test') {
            logger.info('App running at http://localhost:' + serverPort);
            logger.info('________________________________________________________________');
            if (optionsObject.docs !== false) {
              logger.info('API docs (Swagger UI) available on http://localhost:' + serverPort + '/docs');
              logger.info('________________________________________________________________');
            }
          }
        });
        resolve();
      });
      // app.use(require('apisense')())
      app.get('/info', function (req, res) {
        res.send({
          info: 'This API was generated using oas-generator!',
          name: oasDoc.info.title
        });
      });
    } catch (err) {
      logger.error('Error deploying collector-dynamic ', err);
      reject(err);
    }
  });
};

const undeploy = () => {
  process.exit();
};

module.exports = {
  deploy: deploy,
  undeploy: undeploy
};
