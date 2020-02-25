const modman = require('./index.js')
const fs = require('fs')

// create server
var server = modman.server.create(options = {
  key: fs.readFileSync('key.pem'),
  cert: fs.readFileSync('cert.pem'),
  tokens: {'secret': true}
})

server.setupConsoleLogging('modman')

// load modules

console.log('\nWARNING: this script uses a the included key and certificate, you should probably create your own\n')

console.log('[modman]: loading modules...')
server
  .load(require('./packages/sysinfo.js'))
  .load(require('./packages/pm2.js'))
  .load(require('./packages/services.js').allow(['cron', 'zfs', 'docker']))
  .load(require('./packages/docker.js').setTimeoutLength(500))

server.listen()

// test client
async function client(){
  var client = modman.client.create('localhost', 8000, 'secret', {allowSelfSigned: true})
  try {
    var modules = await client.modules()
    console.log('[client]: available modules')
    // console.log(modules)
  } catch (err) {
    console.error(err)
  }

  try {
    var hostname = await client.query('sysinfo', 'hostname')
    console.log('[client]: test: is your hostname ' + hostname + '?')
  } catch (err) {
    console.error(err)
  }

  console.log('\nif you reach this point without any errors, it looks like everything is working.\n')

}
client()
