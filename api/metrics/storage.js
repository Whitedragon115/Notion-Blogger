module.exports = {
    disable: true,
    method: 'post',
    description: 'Publish a blog post by page ID',
    route: async (req, res) => {
        const { getMarkdown } = require('../../function/getPageContent.js');
        const { writeFileSync, mkdirSync, existsSync } = require('fs');
        const path = require('path');
    }
}