const fs = require('fs')
module.exports = dir => {
  if(!fs.existsSync(dir)) fs.mkdirSync(dir)
}
