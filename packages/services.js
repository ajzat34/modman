const si = require('systeminformation')
const error = require('../error.js')

module.exports.printname = 'Services'
module.exports.callname = 'services'
module.exports.version = '0.1.0'

var em
module.exports.startup = function(emitter) {
  em = emitter
}

var available = {}
var allow_all = false

module.exports.allow = function(set){
  for ( var i in set ){
    available[set[i]] = 'yes'
  }
  return module.exports
}

module.exports.allowAll = function(){
  allow_all = true
  return module.exports
}

module.exports.actions = {
  list: async function(q){
    var listed = Object.keys(available).filter(function(name){return (available[name]==='yes')})
    if (allow_all){
      listed.push('all')
    }
    return listed
  },
  query: async function(q) {
    if (!q.name) {
      return error.make(`missing query param: name`, 'malformed_request')
    }
    if (available[q.name] !== 'yes' && !allow_all) {
      em('not-allowed', q.name)
      return error.make(`service ${q.name} not allowed` ,'service_not_allowed')
    }
    var d = (await si.services(q.name))[0]
    return {
      name: d.name,
      runnning: d.running,
      cpu: d.pcpu,
      memory: d.pmem,
    }
  }
}
