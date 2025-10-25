const { Client } = require("@notionhq/client");
const express = require('express');
const request = require('request');
require('dotenv').config();

const notion = new Client({ auth: process.env.NOTION_TOKEN });
module.exports = {
    notion
}

const { writeConfig, readConfig } = require('./tool/json.js');
const { getAllPage } = require('./function/getBlogPage.js');
const { getMarkdown } = require('./function/getPageContent.js');
const logger = require('./tool/log.js');

async function db_source(){
    logger.line();
    logger.box('Notion Database Source Configuration', 'info');
    logger.info('Initializing Notion Database Source Configuration...');

    const databaseId = process.env.DATABASE_ID;
    
    logger.info(`Using Database ID: ${databaseId}`);
    logger.info('Fetching Data Source ID from Notion API...');
    
    const dataSourceId = await notion.databases.retrieve({ database_id: databaseId }).then(res => {
        return res.data_sources[0].id;
    });

    logger.info(`Data Source ID retrieved: ${dataSourceId}`);
    logger.info('Writing configuration to config.json...');

    writeConfig('databaseId', databaseId);
    writeConfig('dataSourceId', dataSourceId);

    logger.success('Configuration written to config.json successfully!');
}

const fs = require('fs');

(async () => {

    const data = await getMarkdown('29716938-eb37-80be-9efa-d9454747f8dc');
    fs.writeFileSync('output.md', data.parent);

})();
