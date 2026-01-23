const NodeCache = require("node-cache");
const responseCache = new NodeCache({
    stdTTL: 60 * 60 * 6 // cache expires in 6hrs from the time of server creation or on server restart
})

module.exports = responseCache