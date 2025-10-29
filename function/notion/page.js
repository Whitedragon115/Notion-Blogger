const { NotionToMarkdown } = require('notion-to-md')
const { notion } = require('../../index.js');
const { fullChildrenSearch } = require('./search.js');

const n2m = new NotionToMarkdown({
    notionClient: notion
});

async function getBlogPage(dataSourceId) {
    const pages = await fullSearch();
    const filteredPages = pages.filter(page => page.parent.data_source_id === dataSourceId);
    const mappedPages = filteredPages.map(page => {
        return {
            pageTitle: page.properties.Title.title[0]?.plain_text || '<Untitled>',
            pageId: page.id
        }
    })

    return mappedPages;
}

async function getBlockChildren(pageId) {
    const pageContent = await fullChildrenSearch(pageId);
    return pageContent;
}

async function getMarkdown(pageId) {
    const mdblocks = await n2m.pageToMarkdown(pageId);
    const mdString = n2m.toMarkdownString(mdblocks);
    return mdString;
}

async function getPage(pageId) {
    try {
        return await notion.pages.retrieve({ page_id: pageId });
    } catch (error) {
        return false;
    }
}

module.exports = {
    getBlogPage,
    getPage,
    getBlockChildren,
    getMarkdown,
}