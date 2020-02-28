// the purpose of this file is to provide an example usage, and a simple way
// to test that everything is wokring properly
// it includes insecure keys and certificate that should be replaced using openssl

const modman = require('./index.js')
const fs = require('fs')

// load modules
console.log('\nWARNING: this script uses a the included key and certificate, you should probably create your own\n')

// create server
var server = modman.server.create(options = {
  key: fs.readFileSync('key.pem'),
  cert: fs.readFileSync('cert.pem'),
  tokens: {'secret': true}
})
// automaticly configure console logging
server.setupConsoleLogging('modman')

console.log('[modman]: loading modules...')
server
  .load(modman.getpkg('sysinfo'))
  .load(modman.getpkg('pm2'))
  .load(modman.getpkg('services').allow(['cron', 'docker']))
  .load(modman.getpkg('docker').setTimeoutLength(500))

// start the server
server.listen()

// test client (needs async wrapper)
async function client(){
  var client = modman.client.create('localhost', 8000, 'secret', {allowSelfSigned: true})
  try {
    var modules = await client.modules()
    console.log('loaded modules from server')
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
