/**
 * 数据持久化服务
 * 使用 JSON 文件存储数据
 * 使用异步操作避免阻塞事件循环
 */

const fs = require('fs').promises;
const path = require('path');
const { STORAGE: STORAGE_LIMITS } = require('../config/constants');

// 数据目录
const DATA_DIR = path.join(__dirname, '../../data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const CONTENT_FILE = path.join(DATA_DIR, 'content.json');
const ALERTS_FILE = path.join(DATA_DIR, 'alerts.json');
const MONITORS_FILE = path.join(DATA_DIR, 'monitors.json');
const SETTINGS_FILE = path.join(DATA_DIR, 'settings.json');

// 写入锁（防止并发写入冲突）
const writeLocks = new Map();

/**
 * 获取写入锁
 */
async function acquireLock(filePath, timeout = 5000) {
  const startTime = Date.now();
  while (Date.now() - startTime < timeout) {
    if (!writeLocks.has(filePath)) {
      writeLocks.set(filePath, true);
      return true;
    }
    await new Promise(resolve => setTimeout(resolve, 10));
  }
  return false;
}

/**
 * 释放写入锁
 */
function releaseLock(filePath) {
  writeLocks.delete(filePath);
}

// 确保数据目录存在
async function ensureDataDir() {
    try {
        await fs.mkdir(DATA_DIR, { recursive: true });
    } catch (error) {
        // 忽略已存在的错误
    }
}

/**
 * 读取 JSON 文件（异步）
 */
async function readJsonFile(filePath, defaultValue = {}) {
    try {
        await ensureDataDir();
        const data = await fs.readFile(filePath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        if (error.code !== 'ENOENT') {
            console.error(`读取文件失败 ${filePath}:`, error.message);
        }
        return defaultValue;
    }
}

/**
 * 写入 JSON 文件（异步）
 */
async function writeJsonFile(filePath, data) {
    try {
        await ensureDataDir();

        // 获取写入锁
        const acquired = await acquireLock(filePath);
        if (!acquired) {
            throw new Error('文件写入繁忙，请稍后再试');
        }

        try {
            // 先写入临时文件，然后重命名（原子操作）
            const tempFile = `${filePath}.tmp`;
            await fs.writeFile(tempFile, JSON.stringify(data, null, 2), 'utf8');
            await fs.rename(tempFile, filePath);
            return true;
        } finally {
            releaseLock(filePath);
        }
    } catch (error) {
        console.error(`写入文件失败 ${filePath}:`, error.message);
        return false;
    }
}

/**
 * 追加写入文件（异步）
 */
async function appendJsonFile(filePath, item) {
    try {
        await ensureDataDir();

        const acquired = await acquireLock(filePath);
        if (!acquired) {
            throw new Error('文件写入繁忙，请稍后再试');
        }

        try {
            const data = await readJsonFile(filePath, { items: [] });
            if (!Array.isArray(data.items)) {
                data.items = [];
            }
            data.items.push({
                ...item,
                timestamp: new Date().toISOString()
            });

            // 限制数组大小
            const maxItems = STORAGE_LIMITS.MAX_SENTIMENTS || 10000;
            if (data.items.length > maxItems) {
                data.items = data.items.slice(-maxItems);
            }

            await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8');
            return true;
        } finally {
            releaseLock(filePath);
        }
    } catch (error) {
        console.error(`追加文件失败 ${filePath}:`, error.message);
        return false;
    }
}

class DataPersistenceService {
    constructor() {
        ensureDataDir();  // 同步确保目录存在
        this.autoSave = true;
        this.saveInterval = 60000; // 1分钟
        this.saveTimers = new Map();
        this.pendingWrites = new Map();  // 待写入缓冲区
    }

    /**
     * 保存用户数据
     */
    async saveUsers(usersMap, usersByIdMap) {
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
    async loadUsers() {
        const data = await readJsonFile(USERS_FILE, { usersByEmail: [], usersById: [] });
        return {
            usersByEmail: new Map(data.usersByEmail || []),
            usersById: new Map(data.usersById || [])
        };
    }

    /**
     * 保存内容数据
     */
    async saveContent(data) {
        return writeJsonFile(CONTENT_FILE, {
            ...data,
            savedAt: new Date().toISOString()
        });
    }

    /**
     * 加载内容数据
     */
    async loadContent() {
        return readJsonFile(CONTENT_FILE, { discussions: [], posts: [], resources: [] });
    }

    /**
     * 保存提醒数据
     */
    async saveAlerts(alertsMap) {
        const data = {
            alerts: Array.from(alertsMap.entries()),
            savedAt: new Date().toISOString()
        };
        return writeJsonFile(ALERTS_FILE, data);
    }

    /**
     * 加载提醒数据
     */
    async loadAlerts() {
        const data = await readJsonFile(ALERTS_FILE, { alerts: [] });
        return new Map(data.alerts || []);
    }

    /**
     * 保存监控数据
     */
    async saveMonitors(monitorsMap, activitiesMap) {
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
    async loadMonitors() {
        const data = await readJsonFile(MONITORS_FILE, { monitors: [], activities: [] });
        return {
            monitors: new Map(data.monitors || []),
            activities: new Map(data.activities || [])
        };
    }

    /**
     * 保存设置
     */
    async saveSettings(settings) {
        return writeJsonFile(SETTINGS_FILE, {
            ...settings,
            savedAt: new Date().toISOString()
        });
    }

    /**
     * 加载设置
     */
    async loadSettings() {
        return readJsonFile(SETTINGS_FILE, {});
    }

    /**
     * 通用保存方法
     */
    async save(key, data) {
        const filePath = path.join(DATA_DIR, `${key}.json`);
        return writeJsonFile(filePath, {
            data,
            savedAt: new Date().toISOString()
        });
    }

    /**
     * 通用加载方法
     */
    async load(key, defaultValue = null) {
        const filePath = path.join(DATA_DIR, `${key}.json`);
        const content = await readJsonFile(filePath, { data: defaultValue });
        return content.data;
    }

    /**
     * 备份数据
     */
    async backup() {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const backupDir = path.join(DATA_DIR, 'backups', timestamp);

        try {
            await fs.mkdir(backupDir, { recursive: true });

            const files = [USERS_FILE, CONTENT_FILE, ALERTS_FILE, MONITORS_FILE, SETTINGS_FILE];
            for (const file of files) {
                try {
                    if (await fs.access(file, fs.constants.F_OK).then(() => true).catch(() => false)) {
                        const basename = path.basename(file);
                        await fs.copyFile(file, path.join(backupDir, basename));
                    }
                } catch (error) {
                    console.warn(`备份文件跳过 ${file}:`, error.message);
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
    async cleanOldBackups() {
        const backupsDir = path.join(DATA_DIR, 'backups');
        try {
            await fs.mkdir(backupsDir, { recursive: true });
        } catch {
            return;
        }

        const now = Date.now();
        const sevenDays = 7 * 24 * 60 * 60 * 1000;

        try {
            const backups = await fs.readdir(backupsDir);
            for (const backup of backups) {
                const backupPath = path.join(backupsDir, backup);
                try {
                    const stats = await fs.stat(backupPath);
                    if (now - stats.mtimeMs > sevenDays) {
                        await fs.rm(backupPath, { recursive: true });
                    }
                } catch (error) {
                    // 跳过无法删除的文件
                }
            }
        } catch (error) {
            console.error('清理备份失败:', error.message);
        }
    }

    /**
     * 获取数据统计
     */
    async getDataStats() {
        const stats = {
            dataDir: DATA_DIR,
            files: {},
            lastModified: {}
        };

        const files = [USERS_FILE, CONTENT_FILE, ALERTS_FILE, MONITORS_FILE, SETTINGS_FILE];
        for (const file of files) {
            const name = path.basename(file, '.json');
            try {
                const fileStats = await fs.stat(file);
                stats.files[name] = {
                    size: fileStats.size,
                    exists: true
                };
                stats.lastModified[name] = fileStats.mtime;
            } catch {
                stats.files[name] = { exists: false };
            }
        }

        return stats;
    }

    /**
     * 批量保存（优化多次写入）
     */
    async saveBatch(saves) {
        const results = {};
        for (const [key, data] of Object.entries(saves)) {
            results[key] = await this.save(key, data);
        }
        return results;
    }

    /**
     * 批量加载（优化多次读取）
     */
    async loadBatch(keys) {
        const results = {};
        for (const key of keys) {
            results[key] = await this.load(key);
        }
        return results;
    }
}

module.exports = new DataPersistenceService();
