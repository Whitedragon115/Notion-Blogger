const Hexo = require('hexo');
const { spawn } = require('child_process');
const path = require('path');

const hexoPath = path.resolve(__dirname, '../../hexo/');

async function initHexoServer(hexoInstance) {
    if (hexoInstance.running) return { status: 'error', message: 'Hexo server is already running.' };

    hexoInstance.instance = new Hexo(hexoInstance.path, {});
    await hexoInstance.instance.init();
    await hexoInstance.instance.call('clean', {});
    await hexoInstance.instance.call('generate', {});
    await hexoInstance.instance.exit();
    await startHexoServer(hexoInstance);

    hexoInstance.running = true;
    hexoInstance.instance = null;

    return { status: 'success', message: 'Hexo server initialized and started.' };
}

function startHexoServer(hexoInstance) {
    return new Promise((resolve, reject) => {
        if (hexoInstance.serverProcess && hexoInstance.serverProcess.pid) {
            return reject({ status: 'error', message: 'Hexo server is already running via child process.' });
        }

        hexoInstance.serverProcess = spawn('npx', ['hexo', 'server', '--port', process.env.PREVIEW_PORT || '4000', '--watch'], {
            cwd: hexoPath,
            detached: false,
            shell: true
        });

        hexoInstance.serverProcess.on('error', (error) => {
            console.error('Failed to start Hexo server:', error);
            return reject({ status: 'error', message: 'Failed to start Hexo server.' });
        });

        hexoInstance.serverProcess.stdout.on('data', (data) => {
            const line = data.toString().trim();

            console.log(line);
            if (line.includes('Hexo is running at')) {
                return resolve({ status: 'success', message: 'Hexo server started successfully.' });
            }

        });

        hexoInstance.serverProcess.stderr.on('data', (data) => {
            console.error(data.toString());
        });

        hexoInstance.serverProcess.on('close', (code) => {
            hexoInstance.serverProcess = null;
        });
    });
}

module.exports = {
    initHexoServer
};