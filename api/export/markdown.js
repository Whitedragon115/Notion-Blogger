

module.exports = {
    disable: false,
    method: 'get',
    description: 'Download one page from Notion to markdown format',
    route: async (req, res) => {

        res.send({ success: true, message: 'Markdown export API is under development.' });

    }
}