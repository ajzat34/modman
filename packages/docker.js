const si = require('systeminformation')
const error = require('../error.js')

module.exports.printname = 'Docker'
module.exports.callname = 'docker'
module.exports.version = '0.1.0'

var timeout = 1000

module.exports.setTimeoutLength = function(time) {timeout=time; return module.exports}

module.exports.startup = function(emitter){
  em = emitter
  new Promise(async function(resolve, reject){
    try {
      let d = await twrap(si.dockerContainers())
      resolve()
    } catch(err){
      reject(err)
    }
  })
  .catch(function(err){em(`WARN`, 'docker is unavailable (you can still query this module, but as long as docker is unavailable all you will get is an internal error): '+ err.toString())})
}

function twrap(fn){return new Promise(async function(resolve, reject){
  setTimeout(function(){
    reject(new Error('Docker Timeout'))
  }, timeout)
  try {
    let d = await fn
    console.log(d)
    resolve()
  } catch (err) {
    console.log(err)
    reject(err)
  }
})}

module.exports.actions = {
  list: async function(q, req){
    let d = await twrap(si.dockerContainers())
    console.log(d)
  }
}
