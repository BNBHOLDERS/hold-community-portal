/**
 * 数据持久化服务
 * 使用 JSON 文件存储数据
 */

const fs = require('fs');
const path = require('path');

// 数据目录
const DATA_DIR = path.join(__dirname, '../../data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const CONTENT_FILE = path.join(DATA_DIR, 'content.json');
const ALERTS_FILE = path.join(DATA_DIR, 'alerts.json');
const MONITORS_FILE = path.join(DATA_DIR, 'monitors.json');
const SETTINGS_FILE = path.join(DATA_DIR, 'settings.json');

// 确保数据目录存在
function ensureDataDir() {
    if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
    }
}

// 读取 JSON 文件
function readJsonFile(filePath, defaultValue = {}) {
    try {
        if (fs.existsSync(filePath)) {
            const data = fs.readFileSync(filePath, 'utf8');
            return JSON.parse(data);
        }
    } catch (error) {
        console.error(`读取文件失败 ${filePath}:`, error.message);
    }
    return defaultValue;
}

// 写入 JSON 文件
function writeJsonFile(filePath, data) {
    try {
        ensureDataDir();
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
        return true;
    } catch (error) {
        console.error(`写入文件失败 ${filePath}:`, error.message);
        return false;
    }
}

class DataPersistenceService {
    constructor() {
        ensureDataDir();
        this.autoSave = true;
        this.saveInterval = 60000; // 1分钟
        this.saveTimers = new Map();
    }

    /**
     * 保存用户数据
     */
    saveUsers(usersMap, usersByIdMap) {
        const data = {
            usersByEmail: Array.from(usersMap.entries()),
            usersById: Array.from(usersByIdMap.entries()),
            savedAt: new Date().toISOString()
        };
        return writeJsonFile(USERS_FILE, data);
    }

    /**
     * 加载用户数据
     */
    loadUsers() {
        const data = readJsonFile(USERS_FILE, { usersByEmail: [], usersById: [] });
        return {
            usersByEmail: new Map(data.usersByEmail || []),
            usersById: new Map(data.usersById || [])
        };
    }

    /**
     * 保存内容数据
     */
    saveContent(data) {
        return writeJsonFile(CONTENT_FILE, {
            ...data,
            savedAt: new Date().toISOString()
        });
    }

    /**
     * 加载内容数据
     */
    loadContent() {
        return readJsonFile(CONTENT_FILE, { discussions: [], posts: [], resources: [] });
    }

    /**
     * 保存提醒数据
     */
    saveAlerts(alertsMap) {
        const data = {
            alerts: Array.from(alertsMap.entries()),
            savedAt: new Date().toISOString()
        };
        return writeJsonFile(ALERTS_FILE, data);
    }

    /**
     * 加载提醒数据
     */
    loadAlerts() {
        const data = readJsonFile(ALERTS_FILE, { alerts: [] });
        return new Map(data.alerts || []);
    }

    /**
     * 保存监控数据
     */
    saveMonitors(monitorsMap, activitiesMap) {
        const data = {
            monitors: Array.from(monitorsMap.entries()),
            activities: Array.from(activitiesMap.entries()),
            savedAt: new Date().toISOString()
        };
        return writeJsonFile(MONITORS_FILE, data);
    }

    /**
     * 加载监控数据
     */
    loadMonitors() {
        const data = readJsonFile(MONITORS_FILE, { monitors: [], activities: [] });
        return {
            monitors: new Map(data.monitors || []),
            activities: new Map(data.activities || [])
        };
    }

    /**
     * 保存设置
     */
    saveSettings(settings) {
        return writeJsonFile(SETTINGS_FILE, {
            ...settings,
            savedAt: new Date().toISOString()
        });
    }

    /**
     * 加载设置
     */
    loadSettings() {
        return readJsonFile(SETTINGS_FILE, {});
    }

    /**
     * 通用保存方法
     */
    save(key, data) {
        const filePath = path.join(DATA_DIR, `${key}.json`);
        return writeJsonFile(filePath, {
            data,
            savedAt: new Date().toISOString()
        });
    }

    /**
     * 通用加载方法
     */
    load(key, defaultValue = null) {
        const filePath = path.join(DATA_DIR, `${key}.json`);
        const content = readJsonFile(filePath, { data: defaultValue });
        return content.data;
    }

    /**
     * 备份数据
     */
    backup() {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const backupDir = path.join(DATA_DIR, 'backups', timestamp);

        try {
            fs.mkdirSync(backupDir, { recursive: true });

            const files = [USERS_FILE, CONTENT_FILE, ALERTS_FILE, MONITORS_FILE, SETTINGS_FILE];
            for (const file of files) {
                if (fs.existsSync(file)) {
                    const basename = path.basename(file);
                    fs.copyFileSync(file, path.join(backupDir, basename));
                }
            }

            console.log(`数据备份完成: ${backupDir}`);
            return true;
        } catch (error) {
            console.error('数据备份失败:', error.message);
            return false;
        }
    }

    /**
     * 清理旧备份（保留最近7天）
     */
    cleanOldBackups() {
        const backupsDir = path.join(DATA_DIR, 'backups');
        if (!fs.existsSync(backupsDir)) return;

        const now = Date.now();
        const sevenDays = 7 * 24 * 60 * 60 * 1000;

        try {
            const backups = fs.readdirSync(backupsDir);
            for (const backup of backups) {
                const backupPath = path.join(backupsDir, backup);
                const stats = fs.statSync(backupPath);
                if (now - stats.mtimeMs > sevenDays) {
                    fs.rmSync(backupPath, { recursive: true });
                }
            }
        } catch (error) {
            console.error('清理备份失败:', error.message);
        }
    }

    /**
     * 获取数据统计
     */
    getDataStats() {
        const stats = {
            dataDir: DATA_DIR,
            files: {},
            lastModified: {}
        };

        const files = [USERS_FILE, CONTENT_FILE, ALERTS_FILE, MONITORS_FILE, SETTINGS_FILE];
        for (const file of files) {
            const name = path.basename(file, '.json');
            if (fs.existsSync(file)) {
                const fileStats = fs.statSync(file);
                stats.files[name] = {
                    size: fileStats.size,
                    exists: true
                };
                stats.lastModified[name] = fileStats.mtime;
            } else {
                stats.files[name] = { exists: false };
            }
        }

        return stats;
    }
}

module.exports = new DataPersistenceService();
