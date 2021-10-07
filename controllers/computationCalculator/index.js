'use strict';
/* eslint-disable no-async-promise-executor */

const governify = require('governify-commons');
const logger = governify.getLogger().tag('computationCalculator');

module.exports.compute = async (dsl, period) => {
  return new Promise(async (resolve, reject) => {
    try {
      let responseList = [];

      for (const stepKey in dsl.metric.params.steps) {
        const stepModel = dsl.metric.params.steps[stepKey];
        logger.debug('Executing STEP: ' + JSON.stringify(stepModel));

        const stepModule = await governify.utils.requireFromFileOrURL(stepModel.script);
        responseList = await stepModule.applyStep(dsl, period, stepModel.inputs, responseList);
        logger.debug('STEPKEY: ' + stepKey + ' R-> ' + JSON.stringify(responseList));
      }

      logger.debug('RESULT:' + JSON.stringify(responseList));

      resolve(responseList);
    } catch (err) {
      reject(err);
    }
  });
};
