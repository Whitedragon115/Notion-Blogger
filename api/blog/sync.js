const { getBlogPage, getMarkdown } = require('../../function/notion/page');
const { writeBlogFile } = require('../../utils/file');
const logger = require('../../utils/log');
const { formatDate } = require('../../utils/time');

module.exports = {
    disable: false,
    method: 'post',
    description: 'Sync notion page to blog',

    /**
     * Provide JSDoc so VS Code shows req/res options in JS files.
     * @param {import('express').Request<{}, any, any, MarkdownQuery>} req
     * @param {import('express').Response} res
     */

    route: async (req, res) => {
        logger.info('!Starting blog sync process...');

        const startTime = Date.now();
        const formatTime = formatDate();

        const data = req.body;

        logger.info('Fetching blog pages from Notion...');
        const pageList = await getBlogPage();
        logger.info(`Retrieved ${pageList.length} blog pages. Starting markdown generation...`);

        for (const page of pageList) {
            if (page.private) {
                logger.info(`Skipping private page: ${page.title}`);
                continue;
            }
            
            logger.info(`Generating markdown for page: ${page.title}`);
            const markdown = await getMarkdown(page.id);
            const metadata = [
                `---`,
                `title: "${page.title}"`,
                `description: "${page.description || ''}"`,
                `cover: "${page.cover}"`,
                `tags: "${page.tags.map(tag => `${tag}`).join(', ')}"`,
                `status: "${page.status}"`,
                `password: "${page.password || ''}"`,
                `${page.metadata.map(meta => {
                    const key = Object.keys(meta)[0];
                    const value = meta[key];
                    return `${key}: "${value}"`;
                }).join('\n')}`,
                `create_time: "${page.create_time}"`,
                `last_edit: "${page.last_edit}"`,
                `---`
            ].join('\n');

            const fullContent = `${metadata}\n\n${markdown.parent}`;
            const safeTitle = page.title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
            const filename = `${formatTime}_${safeTitle || formatDate()}.md`;
            writeBlogFile(fullContent, filename);
            logger.info(`Markdown file written: ${filename}`);
        }

        res.status(200).send({ success: true, message: 'Blog sync completed' });

        const endTime = Date.now();
        logger.info(`API ${endTime - startTime}ms /metrics/blog - Retrieved ${pageList.length} blog pages`);
        logger.success('Blog sync process completed successfully!');
    }
}