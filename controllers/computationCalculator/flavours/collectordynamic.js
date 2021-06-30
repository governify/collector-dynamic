'use strict';
/* eslint-disable no-async-promise-executor */

const governify = require('governify-commons');
const logger = governify.getLogger().tag('computerDynamic');
const config = require('../../../config');
const credentials = config.credentials();

async function applyStep (dsl, period, inputs, responseList) {
  return new Promise(async function (resolve, reject) {
    logger.debug('Applying next step');
    const url = dsl.config.url + inputs.request.endpoint;
    var periodfromms = new Date(period.from).getTime();
    // var periodtoms = new Date(period.to).getTime();
    var realperiod = {};
    logger.debug('DSL: ' + JSON.stringify(dsl));
    if (dsl.metric.scope.periodo_de_actividad === 'alta') {
      realperiod = {
        from: new Date(periodfromms + dsl.config.intervals.alta_actividad_fromOffset).toISOString(),
        to: new Date(periodfromms + dsl.config.intervals.alta_actividad_toOffset).toISOString()
      };
    } else if (dsl.metric.scope.periodo_de_actividad === 'baja') {
      realperiod = {
        from: new Date(periodfromms + dsl.config.intervals.baja_actividad_fromOffset).toISOString(),
        to: new Date(periodfromms + dsl.config.intervals.baja_actividad_toOffset).toISOString()
      };
    } else {
      realperiod = period;
    }

    const body = JSON.parse(JSON.stringify(inputs.request.body).replace(/>>>period.from<<</g, realperiod.from).replace(/>>>period.to<<</g, realperiod.to));
    logger.debug('BODY: ' + JSON.stringify(body));
    const res = await governify.httpClient.request({
      url: url,
      method: 'POST',
      headers: { Authorization: credentials.elk, 'Content-Type': 'application/json' },
      json: body
    }).then(response => { return response.data; }).catch(logger.info);
    logger.debug('RESPONSE' + JSON.stringify(res));

    var resultList = Object.getPropertyByString(res, 'aggregations.services.buckets');
    var finalResult = [];
    resultList.forEach(rs => {
      var newScope = Object.assign({}, dsl.metric.scope);
      newScope.servicio = rs.key;
      var metricResult = rs.avgresponsetime ? rs.avgresponsetime.value : rs.doc_count;
      finalResult.push({ evidences: res.hits.hits, metric: metricResult != null ? metricResult : 0, scope: newScope });
    });

    // Add the result to the current result from previous steps.
    var resultConcat = responseList.concat(finalResult);
    resolve(resultConcat);
  });
}

module.exports.applyStep = applyStep;
