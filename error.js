exports.make = function(message, code) {
  return {
    error: {
      message: message,
      code: code,
    }
  }
}
