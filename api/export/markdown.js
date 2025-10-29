const fs = require('fs')

const { getMarkdown, getPage } = require('../../function/notion/page.js');
const logger = require('../../tool/log.js');
const { formatDate } = require('../../tool/time.js');
const { createDownload } = require('../../tool/file.js');

module.exports = {
    disable: false,
    method: 'get',
    description: 'Getting download link for target page markdown file',
    /**
     * Provide JSDoc so VS Code shows req/res options in JS files.
     * @param {import('express').Request<{}, any, any, MarkdownQuery>} req
     * @param {import('express').Response} res
     */
    route: async (req, res) => {
        const startTime = Date.now();

        const data = req.query;

        const page = await getPage(data.pageId);
        if (!page) return res.status(404).send({ success: false, message: 'Page not found' });

        const title = page.properties.title.title[0]?.plain_text || formatDate();
        const markdown = await getMarkdown(data.pageId);

        const downloadName = createDownload(markdown.parent, 'md', title)

        res.status(200).send({
            success: true,
            markdown: markdown,
            downloadName: {
                link: `${process.env.BASE_URL || 'http://localhost:7630'}/api/file/download?fileName=${downloadName}`,
                name: downloadName
            }
        });

        const endTime = Date.now();
        logger.info(`API ${endTime - startTime}ms /export/markdown - Exported page "${title}" to markdown`);
    }
}