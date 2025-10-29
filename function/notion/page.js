const { NotionToMarkdown } = require('notion-to-md')
const { notion } = require('../../index.js');
const { fullChildrenSearch, fullSearch } = require('./search.js');
const { dataSourceId } = require('../../config.json')

const n2m = new NotionToMarkdown({
    notionClient: notion
});

async function getBlogPage(raw = false, dtId = dataSourceId) {
    const pages = await fullSearch();

    const filteredPages = pages.filter(page => page.parent.data_source_id === dtId && page.properties?.Title.title[0]?.plain_text);

    if (raw) return filteredPages;

    return filteredPages.map(page => {
        const metatext = page.properties.Metadata.rich_text[0]?.plain_text;
        const metaObj = [];

        if (metatext) {
            try {
                metatext.split('\n').forEach(line => {
                    const [key, value] = line.split(':').map(i => i.trim());
                    metaObj.push({ [key]: value });
                })
            } catch (error) {
                logger.error(`Error parsing metadata for page ${page.id}: ${error.message}`);
                metaObj = { error: 'Failed to parse metadata' }
            }
        }

        return {
            id: page.id,
            title: page.properties.Title.title[0]?.plain_text,
            description: page.properties.Description.rich_text[0]?.plain_text,
            cover: page.cover ?? 'none',
            tags: page.properties.Tags.multi_select.map(tag => tag.name),
            status: page.properties.Status?.status.name || '',
            password: page.properties.Password.rich_text[0]?.plain_text || '',
            metadata: metaObj,
            private: page.properties.Private?.checkbox || false,
            create_time: page.created_time,
            last_edit: page.last_edited_time,
            url: page.url
        }
    })

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

async function getPages(pageId) {
    try {
        return await notion.pages.retrieve({ page_id: pageId });
    } catch (error) {
        return false;
    }
}

module.exports = {
    getBlogPage,
    getPage: getPages,
    getBlockChildren,
    getMarkdown,
}