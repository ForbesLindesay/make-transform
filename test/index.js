var fs = require('fs')
var assert = require('assert')
var makeTransform = require('../')

var input = __dirname + '/../index.js'
var output = __dirname + '/fixture/upper.js'
beforeEach(function () {
  fs.mkdirSync(__dirname + '/fixture')
})
afterEach(function () {
  try {
    fs.unlinkSync(output)
  } catch (ex) {}
  fs.rmdirSync(__dirname + '/fixture')
})

it('is just good enough for piping', function (done) {
  fs.createReadStream(input)
    .pipe(makeTransform(function (file, str) {
      return str.toUpperCase()
    })(input))
    .pipe(fs.createWriteStream(output))
    .on('close', function () {
      assert(fs.readFileSync(input, 'utf8').toUpperCase() === fs.readFileSync(output, 'utf8'))
      done()
    })
})
it('async is just good enough for piping', function (done) {
  fs.createReadStream(input)
    .pipe(makeTransform.async(function (file, str, callback) {
      setTimeout(function () {
        callback(null, str.toUpperCase())
      }, 0)
    })(input))
    .pipe(fs.createWriteStream(output))
    .on('close', function () {
      assert(fs.readFileSync(input, 'utf8').toUpperCase() === fs.readFileSync(output, 'utf8'))
      done()
    })
})