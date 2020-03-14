const fs = require('fs')

module.exports.printname = 'MailMan'
module.exports.callname = 'mail'
module.exports.version = '0.1.0'

var path = "/var/modman/mail/"

module.exports.startup = function(){

  fs.accessSync(path, fs.constants.R_OK);

}

module.exports.setpath = function(str) {
  path = str
  return module.exports
}

module.exports.actions = {
  get: async function(q, req){
    r = []
    var filenames = fs.readdirSync(path)
    filenames.forEach(function(filename) {
      if (filename.split('.').pop() !== 'msg') return
      r.push(fs.readFileSync(path + filename, 'utf-8'))
      fs.unlinkSync(path + filename)
    })
    console.log(r)
    return r
  }
}
