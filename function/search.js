const { notion } = require('../index.js');

async function fullSearch(nextCursor = undefined) {
    const data = [];
    const res = await notion.search({
        filter: {
            value: 'page',
            property: 'object'
        },
        start_cursor: nextCursor
    });

    data.push(...res.results);
    if(res.has_more && res.next_cursor) data.push(...await search(res.next_cursor));

    return data;
}

async function fullChildrenSearch(blockId, nextCursor = undefined) {
    const data = [];
    const res = await notion.blocks.children.list({
        block_id: blockId,
        start_cursor: nextCursor
    });
    
    data.push(...res.results);
    if(res.has_more && res.next_cursor) data.push(...await fullChildrenSearch(blockId, res.next_cursor));
    
    return data;
}

module.exports = {
    fullSearch,
    fullChildrenSearch
}