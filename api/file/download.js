const fs = require('fs');
const logger = require('../../tool/log.js');

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

        if (!fs.existsSync(`./markdown/${data.fileName}`)) return res.status(404).send({ success: false, message: 'File not found' });

        res.download(`./markdown/${data.fileName}`);

        const endTime = Date.now();
        logger.info(`API ${endTime - startTime}ms /export/markdown - Exported page "${data.fileName}" to markdown`);

    }
}