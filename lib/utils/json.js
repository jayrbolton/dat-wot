const fs = require('fs')

module.exports = {
  read: path => JSON.parse(fs.readFileSync(path))
, write: (path, obj) => fs.writeFileSync(path, JSON.stringify(obj))
, update: (path, obj) => {
    const old = read(path)
    for (var key in obj) old[key] = obj[key]
    write(path, old)
  }
}
