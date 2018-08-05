var test = require('tape')
var neatInput = require('.')
var EventEmitter = require('events').EventEmitter

var ee = new EventEmitter()
ee.setRawMode = function () {}
ee.resume = function () {}

test('moving cursor left and right', function (t) {
  var input = neatInput({ stdin: ee })
  input.set('ONE')
  var cursor = input.cursor
  ee.emit('keypress', undefined, { name: 'left' })
  t.is(input.cursor, cursor - 1, 'cursor moved left')
  ee.emit('keypress', undefined, { name: 'right' })
  t.is(input.cursor, cursor, 'cursor moved right')
  ee.emit('keypress', undefined, { ctrl: true, name: 'b' })
  t.is(input.cursor, cursor - 1, 'cursor moved left')
  ee.emit('keypress', undefined, { ctrl: true, name: 'f' })
  t.is(input.cursor, cursor, 'cursor moved right')
  t.end()
})
