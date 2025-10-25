const path = require('path');
const AUTO_SHUTDOWN_MS = process.env.AUTO_SHUTDOWN * 60 * 1000;
const log = require('./logging.js')
const hexoPath = path.resolve(__dirname, '../hexo/');

const hexoInstance = {
    instance: null,
    serverProcess: null,
    running: false,
    path: hexoPath,
    autoShutdownTimer: null,
}

let controlModules = null;
const getControlModules = () => {
    if (!controlModules) {
        controlModules = {
            initHexoServer: require('./control/startHexo.js').initHexoServer,
            stopHexoServer: require('./control/stopHexo.js').stopHexoServer,
            deployHexoSite: require('./control/deployHexo.js').deployHexoSite,
        };
    }
    return controlModules;
};

const initHexoServer = async () => {
    const { initHexoServer: initFn } = getControlModules();
    return await initFn(hexoInstance);
};

const stopHexoServer = async () => {
    const { stopHexoServer: stopFn } = getControlModules();
    return await stopFn(hexoInstance);
};

const deployHexoSite = async () => {
    const { deployHexoSite: deployFn } = getControlModules();
    return await deployFn(hexoInstance);
};

function resetAutoShutdownTimer() {
    if (hexoInstance.autoShutdownTimer) {
        clearTimeout(hexoInstance.autoShutdownTimer);
        hexoInstance.autoShutdownTimer = null;
    }
    if (hexoInstance.running) {
        hexoInstance.autoShutdownTimer = setTimeout(async () => {
            log.warningLog(`[AutoShutdown] Server is inactive for ${AUTO_SHUTDOWN_MS / 60000} minutes. Shutting down...`);
            log.grayline();
            await stopHexoServer();
        }, AUTO_SHUTDOWN_MS);
    }
}

module.exports = {
    initHexoServer,
    stopHexoServer,
    deployHexoSite,
    resetAutoShutdownTimer,
    hexoInstance,
};