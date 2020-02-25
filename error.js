exports.make = function(message, code) {
  return {
    error: {
      message: message,
      code: code,
    }
  }
}

exports.read = function(o) {
  var err = new Error(o.message)
  err.code = o.code
  err.recv = o
  return err
}
