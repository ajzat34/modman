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

console.log('WARNING: this script uses a the included key and certificate, you should probably create your own')

console.log('[modman]: loading modules...')
server
  .on('load/loaded', (callname, printname, version) => { console.log(`  -> Loaded: ${printname} (${callname}.v${version})`)} )
  .on('load/fail', (name, reason) => { console.log(`  -> FAILED: ${name} reason: ${reason}`)})

  .load(require('./packages/sysinfo.js'))
  .load(require('./packages/pm2.js'))
  .load(require('./packages/services.js').allow(['cron', 'zfs']))

server.listen()

// // test client
// async function client(){
//   var client = modman.client.create('localhost', 8000, 'secret', {allowSelfSigned: true})
//   var networks = await client.query('sysinfo', 'network')
//   console.log(networks)
// }
// client()
