const logger = require('../../utils/log');

module.exports = {
    disable: false,
    method: ' ',
    description: ' ',

    /**
     * Provide JSDoc so VS Code shows req/res options in JS files.
     * @param {import('express').Request<{}, any, any, MarkdownQuery>} req
     * @param {import('express').Response} res
     */

    route: async (req, res) => {
        const startTime = Date.now();

        const data = req;


        const endTime = Date.now();
        logger.info(`API ${endTime - startTime}ms /metrics/blog - Retrieved ${blogPageList.length} blog pages`);

    }
}