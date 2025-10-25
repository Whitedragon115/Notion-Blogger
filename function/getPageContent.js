const { NotionToMarkdown } = require('notion-to-md')

const { notion } = require('../index.js');
const { fullChildrenSearch } = require('./search.js');

const n2m = new NotionToMarkdown({
    notionClient: notion
});

async function getBlockChildren(pageId) {
    const pageContent = await fullChildrenSearch(pageId);
    return pageContent;
}

async function getMarkdown(pageId) {
    const mdblocks = await n2m.pageToMarkdown(pageId);
    const mdString = n2m.toMarkdownString(mdblocks);
    return mdString;
}

module.exports = {
    getBlockChildren,
    getMarkdown
}