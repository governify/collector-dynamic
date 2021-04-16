var jsyaml = require('js-yaml');
const fs = require('fs');
const path = require("path");
const mustache = require('mustache')
mustache.escape = function (text) { return text; };

var configStringTemplate = fs.readFileSync(path.resolve(__dirname, "./credentials/credentials.yaml"), 'utf8');
var configString = mustache.render(configStringTemplate, process.env, {}, ['$_[', ']']);
if (configString) {
    credentials = jsyaml.safeLoad(configString);
}

/**
 * @module Config
 */

/** Apply new config properties to the current config
 * @param {Object} config Config object with the desired properties to add in the config
 * @return {Object} The final config with the changes applied
 */
function assignConfig(configOverride) {
    if (configOverride) {
        Object.assign(config, configOverride)
    }
    return config;
}


module.exports.credentials = () => {
    if (credentials) {
        return credentials;
    }
    else {
        throw new Error("Credentials file not found.")
    }
}

module.exports.assignConfig = assignConfig;
