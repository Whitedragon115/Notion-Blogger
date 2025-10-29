const fs = require('fs');
const logger = require('../../utils/log.js');
const { writeIpBan } = require('../../utils/json.js');

module.exports = {
    disable: false,
    method: 'get',
    description: 'Download file endpoint',
    /**
     * Provide JSDoc so VS Code shows req/res options in JS files.
     * @param {import('express').Request<{}, any, any, MarkdownQuery>} req
     * @param {import('express').Response} res
     */
    route: async (req, res) => {
        const startTime = Date.now();

        const data = req.query;
        if(!data.fileName) return res.status(400).send({ success: false, message: 'fileName query parameter is required' });

        if(data.fileName.includes('..') || data.fileName.includes('/')) {
            logger.warn(`Invalid fileName parameter: ${data.fileName} from ${req.ip}`);
            writeIpBan('blacklist-ip', req.ip, 'path traversal attempt detected');
            return res.status(400).send({ success: false, message: `Invalid fileName parameter, your file name ${data.fileName} is not allowed` });
        }
        
        if (!fs.existsSync(`./markdown/${data.fileName}`)) return res.status(404).send({ success: false, message: 'File not found' });

        res.download(`./markdown/${data.fileName}`);

        const endTime = Date.now();
        logger.info(`API ${endTime - startTime}ms /export/markdown - Exported page "${data.fileName}" to markdown`);

    }
}