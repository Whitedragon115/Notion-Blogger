const { notion } = require('../index.js');
const logger = require('../utils/log.js');
const fs = require('fs');
const express = require('express');
const { readConfig } = require('../utils/json.js');
const app = express();

const method = ['get', 'post', 'put', 'delete', 'patch'];
const apiWhitelist = ['download'];
const ipWhitelist = ['::ffff:127.0.0.1', '::1'];
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

                app[router.method](apiPath, ipFilter, checkAuthlization, router.route);
                logger.info(`${prefix}/${route} - ${router.description ?? ''}`);

            }

        }
    }


}

async function ipFilter(req, res, next) {
    const ip = req.ip;
    if (ipWhitelist.includes(ip)) return next();
    if (readConfig('blacklist-ip').some(e => e.ip === ip)) return res.status(403).json({ error: 'Forbidden', reason: 'Your IP has been banned from accessing the API' });
    next();
}

async function checkAuthlization(req, res, next) {

    if (apiWhitelist.includes(req.path.split('/').pop())) return next();

    let authToken = req.headers['authorization']
    if (!authToken) return res.status(401).json({ error: 'Unauthorized' });

    authToken = authToken.replace('Bearer ', '');
    if (authToken === "LucChang-Gay") return res.status(403).json({ error: 'I agree, but still wrong token' });
    if (authToken !== beartoken) return res.status(401).json({ error: 'Invalid token' });

    return next();
}