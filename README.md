# make-transform

Make simple string based functions into browserify transforms.  This does not return anything like a true stream and, as a result, is very small to browserify.

The objective was to implement **just** the API needed to support:

 - using it as a browserify transform
 - `process.stdin.pipe(transform).pipe(process.stdout)`
 - `fs.createReadStream('input.js').pipe(transform).pipe(process.stdout)`
 - `process.stdin.pipe(transform).pipe(fs.createWriteStream('output.js'))`
 - `fs.createReadStream('input.js').pipe(transform).pipe(fs.createWriteStream('output.js'))`

In short, this is a helper for when you are forced to interface with streams by factors outside your controll, but the actual API is just processing strings (a far simpler abstraction).

[![Build Status](https://img.shields.io/travis/ForbesLindesay/make-transform/master.svg)](https://travis-ci.org/ForbesLindesay/make-transform)
[![Dependency Status](https://img.shields.io/david/ForbesLindesay/make-transform.svg)](https://david-dm.org/ForbesLindesay/make-transform)
[![NPM version](https://img.shields.io/npm/v/make-transform.svg)](https://www.npmjs.com/package/make-transform)

## Installation

    npm install make-transform

## API

### makeTransform(fn(filename, source))

Make a browserify transform out of a function which takes `filename` and `source` as arguments and returns a string.

If a `source` argument is provided when called, it will just pass through to fn.

Example:

```javascript
var makeTransform = require('make-transform')

module.exports = makeTransform(function (file, source) {
  return source.toLowerCase()
})

var res = module.exports('file.js', 'FUNCTION (STR) { RETURN STR.SPLIT("") }')
// res => 'function (str) { return str.split("") }'

var strm = module.exports('file.js')
strm.end('FUNCTION (STR) { RETURN STR.SPLIT("") }')
strm.pipe(concat(function (res) {
  // res => 'function (str) { return str.split("") }'
}))
```

### makeTransform.async(fn(filename, source, callback))

Make a browserify transform out of a function which takes `filename`, `source` and `callback` as arguments and calls the callback with an optional error and a string.

If a `source` argument and `callback` is provided when called, it will just pass through to fn.

Example:

```javascript
var makeTransform = require('make-transform')

module.exports = makeTransform.async(function (file, source, callback) {
  callback(null, source.toLowerCase())
})

module.exports('file.js', 'FUNCTION (STR) { RETURN STR.SPLIT("") }', function (err, res) {
  // res => 'function (str) { return str.split("") }'
})

var strm = module.exports('file.js')
strm.end('FUNCTION (STR) { RETURN STR.SPLIT("") }')
strm.pipe(concat(function (res) {
  // res => 'function (str) { return str.split("") }'
}))
```

### Promises

Promise support was ommitted in an effor to keep this library ludicrously small.  It's easy enough to make your own "promise transform" though:

```js
var makeTransform = require('make-transform')
var Promise = require('promise')

function transform(file, source) {
  // return a promise for a string here
}
var streaming = makeTransform.async(Promise.nodeify(transform))
module.exports = streaming
module.exports.promise = transform
```

## License

  MIT