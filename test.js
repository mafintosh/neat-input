var test = require('tape')
var neatInput = require('.')
var util = require('./util')
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

test('util: finding start of word backwards', function (t) {
  var str = 'foo bar   baz'
  t.is(util.findWordBeginBackward(str, 0), 0)
  t.is(util.findWordBeginBackward(str, 1), 0)
  t.is(util.findWordBeginBackward(str, 2), 0)
  t.is(util.findWordBeginBackward(str, 3), 0)
  t.is(util.findWordBeginBackward(str, 4), 0)
  t.is(util.findWordBeginBackward(str, 5), 4)
  t.is(util.findWordBeginBackward(str, 6), 4)
  t.is(util.findWordBeginBackward(str, 7), 4)
  t.is(util.findWordBeginBackward(str, 8), 4)
  t.is(util.findWordBeginBackward(str, 9), 4)
  t.is(util.findWordBeginBackward(str, 10), 4)
  t.is(util.findWordBeginBackward(str, 11), 10)
  t.is(util.findWordBeginBackward(str, 12), 10)
  t.is(util.findWordBeginBackward(str, 13), 10)
  t.end()
})

test('util: finding end of word forwards', function (t) {
  var str = 'foo bar   baz'
  t.is(util.findWordEndForward(str, 0), 3)
  t.is(util.findWordEndForward(str, 1), 3)
  t.is(util.findWordEndForward(str, 2), 3)
  t.is(util.findWordEndForward(str, 3), 7)
  t.is(util.findWordEndForward(str, 4), 7)
  t.is(util.findWordEndForward(str, 5), 7)
  t.is(util.findWordEndForward(str, 6), 7)
  t.is(util.findWordEndForward(str, 7), 13)
  t.is(util.findWordEndForward(str, 8), 13)
  t.is(util.findWordEndForward(str, 9), 13)
  t.is(util.findWordEndForward(str, 10), 13)
  t.is(util.findWordEndForward(str, 11), 13)
  t.is(util.findWordEndForward(str, 12), 13)
  t.is(util.findWordEndForward(str, 13), 13)
  t.end()
})

test('moving cursor on word boundaries', function (t) {
  var input = neatInput({ stdin: ee })
  input.set('ONE TWO THREE')
  ee.emit('keypress', undefined, { meta: true, name: 'b' })
  t.is(input.cursor, 8, 'cursor at start of THREE')
  ee.emit('keypress', undefined, { meta: true, name: 'b' })
  t.is(input.cursor, 4, 'cursor at start of TWO')
  ee.emit('keypress', undefined, { meta: true, name: 'b' })
  t.is(input.cursor, 0, 'cursor at start of ONE')
  ee.emit('keypress', undefined, { meta: true, name: 'f' })
  t.is(input.cursor, 3, 'cursor at end of ONE')
  ee.emit('keypress', undefined, { meta: true, name: 'f' })
  t.is(input.cursor, 7, 'cursor at end of TWO')
  ee.emit('keypress', undefined, { meta: true, name: 'f' })
  t.is(input.cursor, 13, 'cursor at end of THREE')
  t.end()
})

test('erasing words backwards, alt-backspace', function (t) {
  var input = neatInput({ stdin: ee })

  input.set('ONE TWO THREE')
  ee.emit('keypress', undefined, { meta: true, name: 'backspace' })
  t.is(input.rawLine(), 'ONE TWO ', 'THREE gone')
  t.is(input.cursor, 8, 'cursor at end of TWO ')
  ee.emit('keypress', undefined, { meta: true, name: 'backspace' })
  t.is(input.rawLine(), 'ONE ', 'TWO gone')
  t.is(input.cursor, 4, 'cursor at start of ONE ')
  ee.emit('keypress', undefined, { meta: true, name: 'backspace' })
  t.is(input.rawLine(), '', 'ONE gone')
  t.is(input.cursor, 0, 'cursor at zero')

  t.end()
})

test('erasing words backwards, ctrl-w', function (t) {
  var input = neatInput({ stdin: ee })

  input.set('ONE TWO THREE')
  ee.emit('keypress', undefined, { ctrl: true, name: 'w' })
  t.is(input.rawLine(), 'ONE TWO ', 'THREE gone')
  t.is(input.cursor, 8, 'cursor at end of TWO ')
  ee.emit('keypress', undefined, { ctrl: true, name: 'w' })
  t.is(input.rawLine(), 'ONE ', 'TWO gone')
  t.is(input.cursor, 4, 'cursor at start of ONE ')
  ee.emit('keypress', undefined, { ctrl: true, name: 'w' })
  t.is(input.rawLine(), '', 'ONE gone')
  t.is(input.cursor, 0, 'cursor at zero')

  t.end()
})

test('erasing words backwards, alt-d', function (t) {
  var input = neatInput({ stdin: ee })

  input.set('ONE TWO THREE')
  ee.emit('keypress', undefined, { ctrl: true, name: 'a' })
  ee.emit('keypress', undefined, { meta: true, name: 'd' })
  t.is(input.rawLine(), ' TWO THREE', 'ONE gone')
  t.is(input.cursor, 0, 'cursor at zero')
  ee.emit('keypress', undefined, { meta: true, name: 'd' })
  t.is(input.rawLine(), ' THREE', 'TWO gone')
  t.is(input.cursor, 0, 'cursor at zero')
  ee.emit('keypress', undefined, { meta: true, name: 'd' })
  t.is(input.rawLine(), '', 'THREE gone')
  t.is(input.cursor, 0, 'cursor at zero')

  t.end()
})
