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

        const blogPageList = await getBlogPage(true);
        if (!blogPageList) return res.status(404).send({ success: false, message: 'No blog pages found' });

        const formatData = blogPageList.map(page => {
            const metatext = page.properties.Metadata.rich_text[0]?.plain_text;
            const metaObj = [];

            if (metatext) {
                try {
                    metatext.split('\n').forEach(line => {
                        const [key, value] = line.split(':').map(i => i.trim());
                        metaObj.push({ [key]: value });
                    })
                } catch (error) {
                    logger.error(`Error parsing metadata for page ${page.id}: ${error.message}`);
                    metaObj = { error: 'Failed to parse metadata' }
                }
            }

            return {
                pageId: page.id,
                title: page.properties.Title.title[0]?.plain_text,
                description: page.properties.Description.rich_text[0]?.plain_text,
                cover: page.cover ?? 'none',
                tags: page.properties.Tags.multi_select.map(tag => tag.name),
                status: page.properties.Status.select?.name,
                password: page.properties.Password.rich_text[0]?.plain_text || '',
                metadata: metaObj,
                create_time: page.created_time,
                last_edit: page.last_edited_time,
                url: page.url
            }
        })



        res.status(200).send({
            success: true,
            length: blogPageList.length,
            pages: formatData,
        });

        const endTime = Date.now();
        logger.info(`API ${endTime - startTime}ms /metrics/blog - Retrieved ${blogPageList.length} blog pages`);

    }
}