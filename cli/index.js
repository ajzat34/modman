const readline = require('readline')
const modman   = require('../index.js')
const util     = require('util')

const mainHelp = `Help Page:
 - connect <host> <token> [<port>] (connect to a server)`
const clientHelp = `Help Page:
 - modules (list modules)
 - query <module>.<action> [<field>=<value> ...]`

var client
var modules

// setup console
var rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
})

rl.on('close', function() {
    process.stdout.write('\n')
    process.exit(0)
})

rl.on('SIGINT', function() {
    process.stdout.write('\n')
    process.exit(0)
})

// helper functions
async function read(prompt) {
  return new Promise(function(resolve){
    rl.question(prompt, function(r){
      resolve(r)
    })
  })
}

function r(str){
  process.stdout.write(str+'\n')
}

async function cli(context, prompt) {
 // console.log(args)
 var running = true
 while (running) {

   // read a line
   var line = await read(prompt)

   // split on ' ' (outside of "")
   var s = line.match(/(?:[^\s"]+|"[^"]*")+/g)

   if (!s){
     continue
   }

   if ( context[s[0]] ) {
     try {
       await context[s[0]](s.slice(1,s.length))
     } catch(err) {
       console.error(err)
     }
   } else if (s[0]==='exit') {
     running=false
   } else {
     r(`command unknown: ${s[0]} (try help)`)
   }
 }
}

// contexts
const mainContext = {
  'help': function(args) {
    r(mainHelp)
  },

  'connect': async function(args) {
    var port = '8000'
    var host
    var token
    if (args.length < 2) { r('connect: enter <host> <token> [<port>]'); return }
    host = args[0]
    token = args[1]
    if (args[2]) { port = args[2]}
    r(`connecting...`)
    client = modman.client.create(host, port, token, {allowSelfSigned: true})
    try {
      modules = await client.modules()
      await cli(clientContext, `modman(${host})# `)
    } catch (err) {
      r(`connection failed: ${err.toString()}`)
    }
  },
}

const clientContext = {
  'help': function(args) {
    r(clientHelp)
  },

  'modules': function(args) {
    r('')
    for (var i in modules) {
      var mod = modules[i]
      r(`${mod.callname} (${mod.printname})`)
      for (var i in mod.actions) {
        r(` -${mod.actions[i]}`)
      }
      r('')
    }
  },

  'query': async function(args) {
    // parse the module action string
    if (!args[0]) { r(`usage: query <module>.<action> [<field>=<value> ...]`); return }
    var s = args[0].split('.')
    // parse the params
    if (!s[1]) { r(`usage: query <module>.<action> [<field>=<value> ...]`); return }
    var params = args.slice(1, args.length)
    var queries = {}
    for (var i in params) {
      var n = params[i].split('=')
      if (n.length != 2) {
        r(`query format is "<field>=<value>"`)
        return
      }
      queries[n[0]] = n[1]
    }
    try {
      var res = await client.query(s[0], s[1], queries)
      r(util.inspect(res))
    } catch (err) {
      r(`FAIL: ${err.toString()} (${err.code})`)
    }
  },
}

// start the main context
async function start() {
  await cli(mainContext, 'modman> ')
  process.exit(0)
}

start()
