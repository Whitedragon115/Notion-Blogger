const file = require('../config.json')
const fs = require('fs');

function writeConfig(name, value) {
    const config = JSON.parse(fs.readFileSync('./config.json', 'utf-8'));
    config[name] = value;
    fs.writeFileSync('./config.json', JSON.stringify(config, null, 4), 'utf-8');
}

function readConfig(name) {
    return file[name];
}

module.exports = {
    writeConfig,
    readConfig
};