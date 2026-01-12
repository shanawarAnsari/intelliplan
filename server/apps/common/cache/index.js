const NodeCache = require("node-cache");
const responseCache = new NodeCache({
    stdTTL: 60 * 60 * 24 * 7// cache expires in 7 days from the time of creation or on server restart
})

module.exports = responseCache