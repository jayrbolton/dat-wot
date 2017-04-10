const fs = require('fs')

module.exports = {
  read: path => JSON.parse(fs.readFileSync(path))
, write: (path, obj) => fs.writeFileSync(path, JSON.stringify(obj))
}
