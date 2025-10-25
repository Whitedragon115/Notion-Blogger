const { hexoInstance } = require('../hexo.js');
const log = require('../logging.js');

async function stopHexoServer() {

    if (!hexoInstance.serverProcess || !hexoInstance.running) return { status: false, message: 'Hexo server is not running.' };

    const pid = hexoInstance.serverProcess.pid;
    const platform = process.platform;

    try {
        switch (platform) {
            case 'win32':
                await win32Taskkill(pid);
                break;
            case 'linux':
                await linuxKill(pid);
                break;
            case 'your_platform':
                await userPlatformKill(pid);
                break;
            default:
                log.errorLog(`Stopping Hexo server because of unknown platform: ${platform}`);
                process.exit(1);
        }

        hexoInstance.serverProcess = null;
        hexoInstance.running = false;
        return { status: true, message: 'Hexo server stopped successfully.' };
    } catch (error) {
        log.errorLog(`Failed to stop Hexo server: ${error.message}`);
        return { status: false, message: `Failed to stop Hexo server: ${error.message}` };
    }
}

function win32Taskkill(pid) {
    return new Promise((resolve, reject) => {
        const { spawn: spawnKiller } = require('child_process');
        const killer = spawnKiller('taskkill', ['/PID', String(pid), '/T', '/F'], { shell: true });
        log.noteLog(`Stopping Hexo server with PID ${pid} using taskkill`);

        killer.on('close', (code) => {
            log.infoLog(`Taskkill exited with code ${code} for PID ${pid}`);
            if (code === 0) {
                resolve();
            } else {
                reject(new Error(`Taskkill failed with exit code ${code}`));
            }
        });

        killer.on('error', (error) => {
            log.errorLog(`Taskkill error: ${error.message}`);
            reject(error);
        });
    });
}

function linuxKill(pid) {
    return new Promise((resolve, reject) => {
        const { exec } = require('child_process');
        
        exec(`ss -tlnp | grep :4001 | grep -o 'pid=[0-9]*'`, (error, stdout, stderr) => {
            handlePortProcesses(stdout, error)
                .then(() => killOriginalPid(pid))
                .then(() => {
                    log.infoLog('All kill operations completed');
                    resolve();
                })
                .catch(reject);
        });
    });
}

function handlePortProcesses(stdout, error) {
    return new Promise((resolve) => {
        if (error) {
            log.errorLog(`Failed to find processes on port 4001: ${error.message}`);
            resolve();
            return;
        }
        
        if (!stdout.trim()) {
            resolve();
            return;
        }

        const pidLines = stdout.trim().split('\n');
        log.infoLog(`Found processes on port 4001: ${pidLines.join(', ')}`);

        const killPromises = pidLines.map(pidLine => {
            const processId = pidLine.split('=')[1];
            return processId ? killProcess(processId) : Promise.resolve();
        });

        Promise.allSettled(killPromises).then(() => resolve());
    });
}

function killProcess(processId) {
    return new Promise((resolve) => {
        const { exec } = require('child_process');
        exec(`kill -KILL ${processId}`, (killError) => {
            if (killError) {
                log.errorLog(`Failed to kill PID ${processId}: ${killError.message}`);
            } else {
                log.infoLog(`Successfully killed PID ${processId}`);
            }
            resolve(); // 總是 resolve，不要因為個別進程 kill 失敗而阻止整體流程
        });
    });
}

function killOriginalPid(pid) {
    return new Promise((resolve) => {
        const { exec } = require('child_process');
        exec(`kill -KILL ${pid} 2>/dev/null`, (originalError) => {
            log.infoLog(originalError ? `Original PID ${pid} cleanup had issues` : `Original PID ${pid} cleaned up`);
            resolve();
        });
    });
}

function userPlatformKill(pid) {
    return new Promise((resolve, reject) => {
        const { spawn: spawnKiller } = require('child_process');
        const killer = spawnKiller('<kill command>', ['arg1', String(pid)], { shell: true });
        log.noteLog(`Stopping Hexo server with PID ${pid} using user-defined command`);

        killer.on('close', (code) => {
            log.infoLog(`Kill exited with code ${code} for PID ${pid}`);
            if (code === 0) {
                resolve();
            } else {
                reject(new Error(`Kill command failed with exit code ${code}`));
            }
        });

        killer.on('error', (error) => {
            log.errorLog(`Kill command error: ${error.message}`);
            reject(error);
        });
    });
}
module.exports = {
    stopHexoServer
}