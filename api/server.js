const { notion } = require('../index.js');
const logger = require('../tool/log.js');
const fs = require('fs');
const express = require('express');
const app = express();

const method = ['get', 'post', 'put', 'delete', 'patch'];
const hideDisable = true;
const beartoken = process.env.NOTION_TOKEN || '';

module.exports = {
    app,
    express,
    load: loadApi
}

/**
 * Load API routes into the Express application
 * @param {express.Application} app 
 */

function loadApi(app) {

    logger.info('!Loading API routes...');

    const readPath = fs.readdirSync('./api');

    for (const folder of readPath) {
        if (fs.lstatSync(`./api/${folder}`).isDirectory()) {
            logger.info(`API - api/${folder}`);

            const routes = fs.readdirSync(`./api/${folder}`);
            for (const route of routes) {
                if (!route.endsWith('.js')) continue;

                const routePath = `./${folder}/${route}`;
                const apiPath = `/${folder}/${route.replace('.js', '')}`;
                const router = require(routePath);

                const method_prefix = '|- ' + (router.method?.toUpperCase() ?? '');

                if (router.disable) {
                    if (hideDisable) continue;
                    logger.info(`${method_prefix}   X ${route} Route is disabled.`);
                    continue;
                }

                router.method = router.method?.toLowerCase();
                const prefix = method_prefix + ' '.repeat(7 - (router.method?.length ?? 0));

                if (!method.includes(router.method)) {
                    logger.error(`${prefix}${route} Invalid method ${router.method} in ${routePath}`)
                    continue
                }

                if (!router.route) {
                    logger.error(`${prefix}${route} No route handler defined in ${routePath}`)
                    continue
                }

                app[router.method](apiPath, checkAuthlization, router.route);
                logger.info(`${prefix}/${route} - ${router.description ?? ''}`);

            }

        }
    }


}

async function checkAuthlization(req, res, next) {
    let authToken = req.headers['authorization']
    if (!authToken) return res.status(401).json({ error: 'Unauthorized' });

    authToken = authToken.replace('Bearer ', '');
    if (authToken === "LucChang-Gay") return res.status(403).json({ error: 'I agree, but still wrong token' });
    if (authToken !== beartoken) return res.status(401).json({ error: 'Invalid token' });

    next();
}