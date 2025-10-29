const fs = require('fs');
const { formatDate } = require('./time');
const blogPath = process.env.BLOG_PATH || './posts/';

function writeBlogFile(content, filename) {
    if (!fs.existsSync(blogPath)) fs.mkdirSync(blogPath, { recursive: true });
    fs.writeFileSync(`${blogPath}/${filename}`, content, 'utf-8');
}

function createDownload(string, suffix, name, alive = 1) {
    const fileName = name + '_' + formatDate() + '.' + suffix;

    fs.writeFileSync(`./markdown/${fileName}`, string);

    setTimeout(() => {
        fs.unlinkSync(`./markdown/${fileName}`);
    }, alive * 60 * 1000);

    return fileName;
}

module.exports = {
    createDownload,
    writeBlogFile
}