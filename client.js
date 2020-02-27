const https = require('https')
const url   = require('url')
const error = require('./error.js')

function request (hostname, port, path, options, queries) {
  return new Promise(function(resolve, reject){
    // create the url
    const reqUrl = url.format({
      protocol: 'https',
      hostname: hostname,
      pathname: path,
      query: queries,
    })
    // create the request options
    var reqOptions = {
      hostname: hostname,
      port: port,
      path: reqUrl,
      method: 'GET',
      timeout: 5000,
    }
    if (options){
      // most servers use self signed certs, so the option to disable checking for this is enabled
      if (options.allowSelfSigned) { reqOptions.rejectUnauthorized = false }
      if (options.timeout) { reqOptions.timeout = options.timeout }
    }
    // send the request
    const req = https.request(reqOptions, function(res) {
      var data = ''

      // start reciving data
      res.on('data', function(chunk) { data += chunk })

      // return the data when the connection ends
      res.on('end', function(){
        if (res.statusCode < 200 || res.statusCode > 299) {
          reject(new Error(`non-success status code: ${res.statusCode}`))
          return
        }
        // reject if the server returned an error
        var p = JSON.parse(data)
        if (p.error) { reject(error.read(p.error)) }
        resolve(p)
      })

    })
    // reject errors
    req.on('error', function(err){ reject(err) })
    req.on('timeout', function(){
      reject(new Error(`timeout`))
    })
    req.end()
  })
}

exports.create = function(address, port, token, options) {
  var r = {}
  r.query = function(moduleName, actionName, params) {
    return request(address, port, `/api/${token}/query/${moduleName}/${actionName}`, options, params)
  }

  r.tick = async function() {
    try {
      var result = await request(address, port, `/api/tick`, options)
      return {result: result, error: null}
    } catch (err) {
      return {result: false, error: err}
    }
  }

  r.modules = function(moduleName, actionName, params) {
    return request(address, port, `/api/${token}/modules`, options, params)
  }

  return r
}
