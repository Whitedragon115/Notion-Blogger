const { getBlogPage } = require('../../function/notion/page');
const logger = require('../../utils/log');

const sortType = ['created_time', 'last_edited', 'A-Z', 'Z-A'];
const groupType = ['status', 'tags'];
const filterType = ['status', 'tags', 'title', 'description_includes'];

module.exports = {
    disable: false,
    method: 'get',
    description: 'Get all blog page information in database',

    /**
     * Provide JSDoc so VS Code shows req/res options in JS files.
     * @param {import('express').Request<{}, any, any, MarkdownQuery>} req
     * @param {import('express').Response} res
     */

    route: async (req, res) => {
        const startTime = Date.now();

        const data = req.query;

        const blogPageList = await getBlogPage();
        if (!blogPageList) return res.status(404).send({ success: false, message: 'No blog pages found' });

        res.status(200).send({
            success: true,
            length: blogPageList.length,
            pages: blogPageList,
        });

        const endTime = Date.now();
        logger.info(`API ${endTime - startTime}ms /metrics/blog - Retrieved ${blogPageList.length} blog pages`);

    }
}