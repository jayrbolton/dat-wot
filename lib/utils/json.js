const fs = require('fs')

const read = (path, callback) => 
  fs.readFile(path, (err, contents) => callback(err, JSON.parse(contents)))

const write = (path, obj, callback) => 
  fs.writeFile(path, JSON.stringify(obj), callback)

const update = (path, updateObj, callback) => {
  read(path, (err, obj) => {
    for (let key in updateObj) obj[key] = updateObj[key]
    fs.writeFile(path, JSON.stringify(obj), callback)
  })
}

module.exports = {read, write, update}
