const error = require('../error.js')
const fs = require('fs')

var pm2

module.exports.printname = 'PM2'
module.exports.callname = 'pm2'
module.exports.version = '0.1.0'

module.exports.startup = function(){
  try {
    pm2 = require('pm2')
  } catch (err) {
    throw new Error('pm2 not installed')
  }
  pm2.connect(function(err){
    if (err) {
      throw err
    }
  })
}

module.exports.actions = {

  // lists all processes and provides details
  // output format {"<id>:<{info}>"}
  list: function() {return new Promise(function(resolve, reject){

    pm2.list(function(err, data){
      if (err) { reject(err); return }
      var l = {}
      for (var i in data){
        var n = data[i]
        l[n.pm_id] = {
          name: n.name,
          id: n.pm_id,
          cpu: n.monit.cpu,
          memory: n.monit.memory,
          user: n.pm2_env.username,
          autorestart: n.pm2_env.autorestart,
          instances: n.pm2_env.instances,
          restarts: n.pm2_env.restart_time,
          unstable_restarts: n.pm2_env.unstable_restarts,
          version: n.pm2_env.version,
          status: n.pm2_env.status,
          start_time: n.pm2_env.pm_uptime,
        }
      }
      resolve(l)
    })

  })},

  // similar to list, but returns a object with pm_id as the key, and only dynamic info
  update: function(query) { return new Promise(function(resolve, reject){

    pm2.list(function(err, data){
      if (err) { reject(err); return }
      var l = {}
      for (var i in data){
        var n = data[i]
        l[n.pm_id] = {
          cpu: n.monit.cpu,
          memory: n.monit.memory,
          instances: n.pm2_env.instances,
          restarts: n.pm2_env.restart_time,
          unstable_restarts: n.pm2_env.unstable_restarts,
          status: n.pm2_env.status,
          start_time: n.pm2_env.pm_uptime,
        }
      }
      resolve(l)
    })

  })},

  log: function(q) { return new Promise(function(resolve, reject){

    if (!q.process) { resolve(error.make(`missing query param: process`, 'malformed_request')) }

    pm2.describe(q.process, function(err, data){
      if(err){ reject(err); return}

      if (!data.length) {
        resolve( error.make(`process ${q.process} unknown by pm2/log`, 'pm2_process_unknown') )
        return
      }

      var logdir = data[0].pm2_env.pm_out_log_path
      var errdir = data[0].pm2_env.pm_err_log_path

      var logf = 'error loading log...'
      var errf = 'error loading log...'

      try {
        logf = fs.readFileSync(logdir).toString()
      } catch (err) {
        console.error(err)
      }

      try {
        errf = fs.readFileSync(errdir).toString()
      } catch (err) {
        console.error(err)
      }

      resolve({
        stdout: logf,
        stderr: errf,
      })
    })

  })},

  flush: function(q) { return new Promise(function(resolve, reject){
    var process = 'all'
    if (q.process){process=q.process}

    pm2.flush(q.process, function(err, data){
      if(err){ reject(err); return}
      resolve({})
    })
  })},

  // format: function() { return new Promise(function(resolve, reject){
  //
  // })},
}
