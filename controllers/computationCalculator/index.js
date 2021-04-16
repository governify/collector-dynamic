const got = require('got');
const config = require('../../config');
const { response } = require('express');
var requireFromUrl = require('require-from-url/sync');
const credentials = config.credentials();

module.exports.compute = async (dsl, period) => {
  return new Promise(async (resolve, reject) => {

    try {

      var responseList = []


        for (stepKey in dsl.metric.params.steps){
          var stepModel = dsl.metric.params.steps[stepKey];
          console.log("Executing STEP: " + JSON.stringify(stepModel));
          var stepModule = require(stepModel.script);
          responseList = await stepModule.applyStep(dsl, period, stepModel.inputs, responseList)
          console.log("STEPKEY: " + stepKey + " R-> " + JSON.stringify(responseList)); 
      
        }

      
      console.log("RESULT:" + JSON.stringify(responseList));


      resolve(responseList);
    } catch (err) {
      reject(err);
    }
  });
};

