const session = require('express-session');
const jwt = require('jsonwebtoken');
const path = require("path");
const { generateId } = require(path.join(__dirname, "/generazione"));

class Session {

    constructor(memory, timeout = 3600000) {
        this.timeout = timeout;
        this.blackList = new Map();
        this.tokenKey = generateId(64, memory);
        setInterval(() => this._clearBlackList(), timeout);
    }

    setupSession(config = {}) {
        return session({
            ...config,
            secret: this.tokenKey
        });
    }

    set(req, data = {}) {
        if (req && req.session)
            req.session.storeData = { ...data };
        const seconds = Math.floor(this.timeout / 1000);
        return jwt.sign({ ...data }, this.tokenKey, { expiresIn: seconds });
    }

    get(req, token = null) {
        if (req?.session?.storeData)
            return req.session.storeData;
        if (token) {
            if (this.blackList.has(token)) return {};
            try {
                return jwt.verify(token, this.tokenKey);
            } catch {
                return {};
            }
        }
        return {};
    }

    invalidate(req, token) {
        if (req?.session)
            req.session.destroy();
        if (token)
            this.blackList.set(token, Date.now() + this.timeout);
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

    _clearBlackList() {
        const now = Date.now();
        for (const [token, expiry] of this.blackList.entries()) {
            if (now > expiry) this.blackList.delete(token);
        }
    }
}

module.exports = { Session };