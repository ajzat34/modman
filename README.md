# Modman (Modular Remote Server Management API)
Customizable, Expandable, Server Monitoring & Management API.

# Getting Started
### Installing:
* create a project
* install `npm install ajzat34/modman`
* include `const modman = require('modman')`
* create a key and self signed cert (https://nodejs.org/en/knowledge/HTTP/servers/how-to-create-a-HTTPS-server/)
Sample script:
```
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
  .load(modman.getpkg('services').allow(['cron']))
  .load(modman.getpkg('docker').setTimeoutLength(500))
  .load(modman.getpkg('mailman'))
  
 // start the server
server.listen()
```

# CLI Client
The Command Line tool is an interactive environment to connect to and control modman servers.
```sh
$ node cli/index.js
```
(This will be simplified later ^)
## Connect to a server
Connect to a server with the `connect` command
```
modman> connect <server address> <api token/key> [optional: port]
```
This does not actually establish a long term connection with the server; however it does test the connection, load server information, and enter the client mode for that server.

### Examples:
```
modman> connect localhost token
```
```
modman> connect 192.168.1.8 fj902939ufjs 80000
```

## Show Server Modules
Use the `modules` command in client mode (`#` prompt) to list a servers supported modules.
NOTE: if the servers module list changes while in client mode (this can only happen if the server restarts), you will need to reconnect to update the list.
```
modman(server)# modules
```

## Query a Module
Use the `query` in client mode (`#` prompt) command to query a module.
```
modman(server)# query <module>.<action> [<field>=<value> ...]
```
### Examples:
```
modman(server)# query sysinfo.hostname
```
```
modman(server)# query pm2.log process=0
```

## Exit Client Mode
Use the `exit` command to return to the previous state.
```
modman(server)# exit
modman>
```
