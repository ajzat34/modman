const express     = require('express')
const events      = require('events')
const url         = require('url')
const querystring = require('querystring')
const error       = require('./error.js')
const https       = require('https')

// returns true if auth failed
function auth(req, res, tokens, em){
  if (!tokens[req.params.token]) {
    if (em) { em.emit('not-allowed', req.params.token, req) }
    res.json(error.make(`invalid token`, 'invalid_token'))
    return true
  }
  return false
}

exports.create = function(options) {

  // setup
  var modules = {}
  var moduleinfo = []
  var runnning = false
  var server

  if (!options) {
    throw new Error('missing required options')
  }
  if (!options.tokens) {
    throw new Error('missing required options.tokens')
  }

  // create an event emitter
  var em = new events.EventEmitter()

  // create an express app
  const app = express()

  // setup api calls
  app.get('/', function(req, res){
    res.send(`modman server\nlist modules at /api/<key>/modules\ncall modules with /api/<key>/module/<module>/<action>\n`)
  })

  // setup api calls
  app.get('/api/tick', function(req, res){
    res.json(true)
  })

  // module list
  app.get('/api/:token/modules', function(req, res){
    if (auth(req, res, options.tokens, em)){return}
    res.json(moduleinfo)
  })

  // query modules
  app.get('/api/:token/query/:module/:action', async function(req, res){
    if (auth(req,res,options.tokens, em)){return}
    em.emit('query', req)
    var p = url.parse(req.url, true)
    var q = req.params
    // check for query params
    if (!modules[q.module]) { res.json(error.make(`module: "${q.module}" unknown by server`, 'module_unknown')); return }
    if (!modules[q.module].actions[q.action]) { res.json(error.make(`action: "${q.action}" unknown by module: "${q.module}"`, 'module_action_unknown')); return }
    // query the module
    var action = modules[q.module].actions[q.action]
    if (typeof action === 'object' || typeof action === 'string' || typeof action === 'number' ) {res.json(action); return}
    if (typeof action === 'function') {
      try {
        // hide the token from the module
        req.params.token = null
        delete req.params.token
        res.json(await action(p.query, req))
      } catch(err) {
        console.error(err)
        res.json(error.make(`internal error`, 'internal_error'))
      }
      return
    }
    // if the type is unknown
    res.json(error.make(`internal error`, 'internal_error'))
  })

  var httpserver

  // start the server
  em.listen = function(port, address) {
    // gen module info
    for (var i in modules) {
      moduleinfo.push({
        callname: modules[i].callname,
        printname: modules[i].printname,
        actions: Object.keys(modules[i].actions)
      })
    }

    // use the default port in none specified
    if (!port) { port = 8000 }

    // start express https server
    https.createServer(options, app)
    .listen(port, function () {
      running = true
      em.emit('log', `listening on ${port}`)
    })
  }

  em.load = function(pkg) {
    if (runnning) { throw new Error(`Cannot load new modules: already running`) }
    if (!pkg.callname) { em.emit('load/fail', 'unknown', `required field (callname) missing`); return em}
    if (!pkg.printname) { pkg.printname = pkg.callname}
    if (!pkg.version) { pkg.version = '0.0.0'}
    if (!pkg.actions) { em.emit('load/fail', pkg.callname, `required field (actions) missing`); return em}
    if (pkg.startup) {
      try {
        var result = pkg.startup(function(eventName, ...args){em.emit(`module`, `module:${pkg.callname}/${eventName}`, args)})
      } catch( err ){
        em.emit('load/fail', pkg.callname, `startup script error: ${err}`)
        return
      }
    }
    modules[pkg.callname] = pkg
    em.emit('load/loaded', pkg.callname, pkg.printname, pkg.version)
    return em
  }

  em.setupConsoleLogging = function(name) {
    em
      .on('log', (msg) => {console.log(`[${name}]: ` + msg)})
      .on('warn', (msg) => {console.log(`[${name}/WARN]: ` +msg)})
      .on('error', (msg) => {console.error(`[${name}/ERROR]: ` +msg)})
      .on('not-allowed', (token, req) => {console.error(`[${name}/auth]: ` + `A request was made to ${req.url} with invalid token ${token} by ${req.connection.remoteAddress}`)})
      .on('query', (req) => {console.log(`[${name}/logging]: ` + `A query was made to ${req.url} by ${req.connection.remoteAddress}`)})
      .on('module', (moduleString, msg) => {console.error(`[${name}/${moduleString}]: ` +msg)})
      .on('load/loaded', (callname, printname, version) => { console.log(` -> Loaded: ${printname} (${callname}.v${version})`)} )
      .on('load/fail', (name, reason) => { console.log(` -> FAILED: ${name} reason: ${reason}`)})
  }

  return em
}
