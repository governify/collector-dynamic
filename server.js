'use strict';

const { logger } = require('oas-tools/src/configurations');

const deploy = (env, commonsMiddleware) => {
  return new Promise((resolve, reject) => {
    try {
      var fs = require('fs');
      var http = require('http');
      var path = require('path');
      const governify = require('governify-commons');
      const logger = governify.getLogger().tag('initialization');
      var express = require('express');
      var app = express();
      app.use(commonsMiddleware)
      var bodyParser = require('body-parser');
      app.use(bodyParser.json({
        strict: false
      }));
      var oasTools = require('oas-tools');
      var jsyaml = require('js-yaml');
      var serverPort = process.env.PORT || 5501;

      var spec = fs.readFileSync(path.join(__dirname, '/api/oas-doc.yaml'), 'utf8');
      var oasDoc = jsyaml.safeLoad(spec);

      var optionsObject = {
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
      logger.error("Error deploying collector-dynamic ", err);
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
