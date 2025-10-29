const { Client } = require("@notionhq/client");
const fs = require('fs');
require('dotenv').config();

const logger = require('./tool/log.js');
const silentLogger = { debug: () => { }, info: () => { }, warn: () => { }, error: () => { }, };

const notion = new Client({
    auth: process.env.NOTION_TOKEN,
    logger: silentLogger,
});

module.exports = { notion }

logger.box('Initializing Notion Blogger Application', 'info');
checkFiles();

const { writeConfig, readConfig } = require('./tool/json.js');
const { getMarkdown, getBlogPage } = require('./function/notion/page.js');
const { express, app, load: loadAPI } = require('./api/server.js');

async function init() {
    await cleanTemp();
    await apiServer();

    logger.box('Server fully started', 'success');
}

async function apiServer() {
    logger.box('Starting API Server', 'info');

    const port = process.env.PORT || 7630;
    const apiRouter = express.Router();
    loadAPI(apiRouter);
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    app.use('/api', apiRouter);

    return new Promise((resolve, reject) => {
        const server = app.listen(port, () => {
            logger.success(`API Server is running in local using port ${port}`);
            logger.success('Public URL is ' + (process.env.BASE_URL || `http://localhost:${port}`));
            resolve(server);
        });
        server.on('error', (err) => {
            logger.error(`Failed to start API Server: ${err.message}`);
            reject(err);
        });
    });
}

async function db_source() {
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

async function cleanTemp(){
    logger.box('Cleaning Temporary Files', 'info');
    const tempFolder = './markdown';
    let count = 0;

    logger.info('Cleaning temporary files...');
    if (fs.existsSync(tempFolder)) {
        const files = fs.readdirSync(tempFolder);
        files.forEach(file => {
            fs.unlinkSync(`${tempFolder}/${file}`);
            count++;
        });
    }

    logger.success(`Temporary files cleaned successfully! Deleted ${count} files.`);
}

async function checkFiles() {
    const defaultSyntax = [{ 'json': '{}' }]

    const checkFiles = ['./config.json']
    const checkFolders = ['./markdown']

    logger.info('Checking files...')
    for (const file of checkFiles) {
        if (!fs.existsSync(file)) {
            logger.warn(`File ${file} not found. Created a new one.`);
            const subfix = file.split('.').pop()
            const syntax = defaultSyntax.find(item => Object.keys(item)[0] === subfix)?.[subfix] ?? ''
            fs.writeFileSync(file, syntax);
            logger.success(`File ${file} created successfully.`);
        } else {
            logger.info(`File ${file} exists.`);
        }
    }

    logger.info('Checking folders...')
    for (const folder of checkFolders) {
        if (!fs.existsSync(folder)) {
            logger.warn(`Folder ${folder} not found. Created a new one.`);
            fs.mkdirSync(folder);
            logger.success(`Folder ${folder} created successfully.`);
        } else {
            logger.info(`Folder ${folder} exists.`);
        }
    }

    logger.success('File and folder check completed.');
}

init();