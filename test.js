const modman = require('./index.js')
const fs = require('fs')

// create server
var server = modman.server.create(options = {
  key: fs.readFileSync('key.pem'),
  cert: fs.readFileSync('cert.pem'),
  tokens: {'secret': true}
})

  .on('log', (msg) => {console.log('[modman]: ' + msg)})
  .on('warn', (msg) => {console.log('[modman/warn]: ' +msg)})
  .on('error', (msg) => {console.error('[modman/error]: ' +msg)})


// load modules
console.log('[modman]: loading modules...')
server
  .on('load/loaded', (callname, printname, version) => { console.log(`  -> Loaded: ${printname} (${callname}.v${version})`)} )
  .on('load/fail', (name, reason) => { console.log(`  -> FAILED: ${name} reason: ${reason}`)})

  .load(require('./packages/sysinfo.js'))
  .load(require('./packages/pm2.js'))

server.listen()
