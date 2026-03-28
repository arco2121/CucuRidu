const session = require('express-session');
const jwt = require('jsonwebtoken');
const path = require("path");
const { generateId } = require(path.join(__dirname, "/generazione"));
const MemoryStore = require('memorystore')(session)
const pgSession = require('connect-pg-simple')(session);

class Session {

    constructor(timeout = 3600000, token, blacklist = new Map(), pool = false) {
        this.timeout = timeout;
        this.pool = pool;
        this.blackList = blacklist;
        this.tokenKey = token;
        const clearBlacklist = async () => {
            try {
                await this._clearBlackList();
            } catch (error) { console.error(error.message); }
            finally {
                setTimeout(clearBlacklist, timeout);
            }
        };

        clearBlacklist();
    }

    setupSession(config = {}) {
        const store = this.pool ? new pgSession({
            pool: this.pool,
            tableName: 'sessions',
            createTableIfMissing: true,
            pruneSessionInterval: this.timeout/1000
        }) : new MemoryStore({
            checkPeriod: this.timeout/1000
        });

        return session({
            ...config,
            secret: this.tokenKey,
            store
        });
    }

    set(req, data = {}) {
        if (req && req.session)
            req.session.storeData = { ...data };
        const seconds = Math.floor(this.timeout / 1000);
        return jwt.sign({ ...data }, this.tokenKey, { expiresIn: seconds });
    }

    async get(req, token = null) {
        if (req?.session?.storeData)
            return req.session.storeData;
        if (token) {
            if (await this.blackList.has(token)) return {};
            try {
                return jwt.verify(token, this.tokenKey);
            } catch {
                return {};
            }
        }
        return {};
    }

    async invalidate(req, token) {
        if (req?.session)
            req.session.destroy();
        if (token)
            await this.blackList.set(token, Date.now() + this.timeout);
    }

    validate(keys, ...sources) {
        const result = {};
        const params = Array.isArray(keys) ? keys : Object.keys(keys);
        for (const source of sources) {
            let data = {};
            if (typeof source === "string") {
                data = this.get(null, source);
            } else if (source && typeof source === "object") {
                data = source.session?.storeData || source;
            }
            for (const key of params) {
                if (data[key] !== undefined && data[key] !== null) {
                    if (result[key] === undefined) {
                        result[key] = data[key];
                    }
                }
            }
        }
        return result;
    }

    async _clearBlackList() {
        const now = Date.now();
        for (const [token, expiry] of await this.blackList.entries()) {
            if (now > expiry) await this.blackList.delete(token);
        }
    }
}

module.exports = { Session };