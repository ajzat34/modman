exports.server = require('./server.js')
exports.client = require('./client.js')

exports.getpkg = function(name){
  return require(`./packages/${name}.js`)
}
