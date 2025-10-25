
const Hexo = require('hexo');
const { hexoInstance, stopHexoServer } = require('../hexo.js');

async function deployHexoSite() {
    if (hexoInstance.running) await stopHexoServer();

    const tmpHexo = new Hexo(hexoInstance.path, {});
    await tmpHexo.init();
    await tmpHexo.call('clean', {});
    await tmpHexo.call('generate', {});
    await tmpHexo.call('deploy', {});
    await tmpHexo.exit();

    return { status: 'success', message: 'Deployment completed successfully.' };
}

module.exports = {
    deployHexoSite
}