'use strict'

module.exports = makeTransform
module.exports.async = makeTransformAsync

function makeTransform(fn) {
  return function (file, source) {
    if (typeof source === 'string') {
      return fn(file, source)
    }
    return new FakeStream(function (buffer, destination, onError) {
      var res
      try {
        res = fn(file, buffer)
      } catch (ex) {
        return onError(ex)
      }
      destination.end(res)
    })
  }
}
function makeTransformAsync(fn) {
  return function (file, source, callback) {
    if (typeof source === 'string' && typeof callback === 'function') {
      return fn(file, source, callback)
    }
    return new FakeStream(function (buffer, destination, onError) {
      fn(file, buffer, function (err, res) {
        if (err) return onError(err)
        destination.end(res)
      })
    })
  }
}

function FakeStream(finished) {
  this.errorHandlers = []
  this.piped = null
  this.buffer = ''
  this.ended = false
  this.finished = finished
}
FakeStream.prototype.on = function (name, handler) {
  if (name !== 'error') return this
  this.errorHandlers.push(handler)
  return this
}
FakeStream.prototype.once = FakeStream.prototype.on
FakeStream.prototype.emit = function (name, data) {
  if (name !== 'error') return this
  for (var i = this.errorHandlers.length - 1; i >= 0; i--) {
    this.errorHandlers[i](data)
  }
  return this
}
FakeStream.prototype.removeListener = function () {}
FakeStream.prototype.pipe = function (strm) {
  if (arguments.length > 1) {
    throw new Error('make-transform returns a FakeStream, it doesn\'t support additional arguments to pipe')
  }
  if (this.piped) {
    throw new Error('make-transform returns a FakeStream, it doesn\'t support being piped multiple times')
  }
  this.piped = strm
  this.finish()
  return strm
}
FakeStream.prototype.write = function (str) {
  this.buffer += str.toString('utf8')
  return true
}
FakeStream.prototype.finish = function () {
  if (this.ended && this.piped) {
    this.finished(this.buffer, this.piped, this.emit.bind(this, 'error'))
  }
}
FakeStream.prototype.end = function (str) {
  if (str) this.write(str)
  this.ended = true
  this.finish()
}