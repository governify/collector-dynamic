'use strict';
/* eslint-disable no-async-promise-executor */

const governify = require('governify-commons');
const logger = governify.getLogger().tag('computationCalculator');

module.exports.compute = async (dsl, period) => {
  return new Promise(async (resolve, reject) => {
    try {
      var responseList = [];

      for (const stepKey in dsl.metric.params.steps) {
        var stepModel = dsl.metric.params.steps[stepKey];
        logger.info('Executing STEP: ' + JSON.stringify(stepModel));

        var stepModule = await governify.utils.requireFromFileOrURL(stepModel.script);
        responseList = await stepModule.applyStep(dsl, period, stepModel.inputs, responseList);
        logger.info('STEPKEY: ' + stepKey + ' R-> ' + JSON.stringify(responseList));
      }

      logger.info('RESULT:' + JSON.stringify(responseList));

      resolve(responseList);
    } catch (err) {
      reject(err);
    }
  });
};
