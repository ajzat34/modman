const https = require('https')

exports.create = function(address, port, token, options) {
  var r = {}
  r.query = function(moduleName, actionName) {
    return new Promise(function(resolve, reject){
      // create the request options
      var reqOptions = {
        hostname: address,
        port: port,
        path: `/api/${token}/query/${moduleName}/${actionName}`,
        method: 'GET',
      }
      // most servers use self signed certs, so the option to disable checking for this is enabled
      if (options.allowSelfSigned) {
        reqOptions.rejectUnauthorized = false
      }
      // send the request
      const req = https.request(reqOptions, function(res) {
        var data = ''
        // start reciving data
        res.on('data', function(chunk) {
          data += chunk
        })
        // return the data when the connection ends
        res.on('end', function(){
          if (res.statusCode < 200 || res.statusCode > 299) {
            reject({message: 'non-success status code', code: 'non_success_code', statusCode: res.statusCode})
            return
          }
          // reject if the server returned an error
          var p = JSON.parse(data)
          if (p.error) {
            reject(p.error)
          }
          resolve(p)
        })
      })
      // reject errors
      req.on('error', function(error){
        reject(error)
      })
      req.end()
    })
  }

  return r
}
