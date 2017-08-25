const fs = require('fs')

const read = (path, callback) =>
  fs.readFile(path, (err, contents) => {
    let obj
    try {
      obj = JSON.parse(contents)
    } catch (e) {
      throw Error('Unable to parse JSON from file [' + path + ']: ' + contents)
    }
    callback(err, obj)
  })

const write = (path, obj, callback) =>
  fs.writeFile(path, JSON.stringify(obj), callback)

const update = (path, updateObj, callback) => {
  read(path, (err, obj) => {
    if (err) callback(err)
    for (let key in updateObj) obj[key] = updateObj[key]
    fs.writeFile(path, JSON.stringify(obj), callback)
  })
}

module.exports = {read, write, update}
