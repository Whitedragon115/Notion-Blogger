const { notion } = require('../index.js');
const { fullSearch } = require('./search.js');

async function getAllPage(dataSourceId) {

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

module.exports = {
    getAllPage
}