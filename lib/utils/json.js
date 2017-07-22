const fs = require('fs')

const read = path => JSON.parse(fs.readFileSync(path))
const write = (path, obj) => fs.writeFileSync(path, JSON.stringify(obj))
const update = (path, obj) => {
  const old = read(path)
  for (let key in obj) old[key] = obj[key]
  write(path, old)
}

module.exports = {read, write, update}
