const fs = require('fs');
const { formatDate } = require('./time');

function createDownload(string, suffix, name, alive = 1) {
    const fileName = name + '_' + formatDate() + '.' + suffix;

    fs.writeFileSync(`./markdown/${fileName}`, string);

    setTimeout(() => {
        fs.unlinkSync(`./markdown/${fileName}`);
    }, alive * 60 * 1000);

    return fileName;
}

module.exports = {
    createDownload
}