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

test('backspace', function (t) {
  var input = neatInput({ stdin: ee })

  input.set('ONE')
  var cursor = input.cursor
  ee.emit('keypress', undefined, { name: 'backspace' })
  t.is(input.rawLine(), 'ON', 'E is gone')
  t.is(input.cursor, cursor - 1, 'cursor moved left')

  input.set('ONE')
  cursor = input.cursor
  ee.emit('keypress', undefined, { name: 'left' })
  ee.emit('keypress', undefined, { name: 'backspace' })
  t.is(input.rawLine(), 'OE', 'N is gone')
  t.is(input.cursor, cursor - 2, 'cursor moved left twice')

  input.set('ONE')
  ee.emit('keypress', undefined, { name: 'left' })
  ee.emit('keypress', undefined, { name: 'left' })
  ee.emit('keypress', undefined, { name: 'left' })
  ee.emit('keypress', undefined, { name: 'backspace' })
  t.is(input.rawLine(), 'ONE', 'no change')
  t.is(input.cursor, 0, 'cursor at the start')

  t.end()
})

test('moving cursor to beginning and end of line', function (t) {
  var input = neatInput({ stdin: ee })
  input.set('ONE')
  var cursor = input.cursor
  ee.emit('keypress', undefined, { ctrl: true, name: 'a' })
  t.is(input.cursor, 0, 'cursor at the start of line')
  ee.emit('keypress', undefined, { ctrl: true, name: 'e' })
  t.is(input.cursor, cursor, 'cursor back at end of line')
  t.end()
})

test('erasing whole line', function (t) {
  var input = neatInput({ stdin: ee })
  input.set('ONE TWO THREE')
  ee.emit('keypress', undefined, { ctrl: true, name: 'u' })
  t.is(input.cursor, 0, 'cursor at the start of line')
  t.is(input.rawLine(), '', 'empty line')
  t.end()
})
