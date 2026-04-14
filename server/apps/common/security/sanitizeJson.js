
const validator = require("validator");

function sanitizeJsonDeep(value) {
    function walk(val) {
        if (val === null || val === undefined) return val;

        if (typeof val === "string") return validator.escape(val);

        if (typeof val === "number" || typeof val === "boolean") return val;

        if (Array.isArray(val)) return val.map(walk);

        if (typeof val === "object") {
            const out = {};
            for (const k of Object.keys(val)) out[k] = walk(val[k]);
            return out;
        }

        return null;
    }
    return walk(value);
}

module.exports = { sanitizeJsonDeep };