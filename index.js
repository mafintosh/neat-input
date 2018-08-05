var events = require('events')
var keypress = require('keypress')

module.exports = neatInput

function neatInput (opts) {
  if (!opts) opts = {}

  var style = opts.style
  var showCursor = !!opts.showCursor
  var input = new events.EventEmitter()
  var rawLine = ''
  var buf = ''
  var stdin = opts.stdin || process.stdin

  if (!showCursor) hideCursor()

  input.destroyed = false
  input.cursor = 0
  input.line = line
  input.rawLine = lineNoStyle
  input.enter = onenter
  input.set = set
  input.destroy = destroy

  if (stdin.setRawMode) {
    stdin.setRawMode(true)
    keypress(stdin)
    stdin.resume()
    stdin.on('keypress', onkeypress)
  } else {
    stdin.setEncoding('utf-8')
    stdin.on('data', function (data) {
      buf += data
      while (true) {
        var nl = buf.indexOf('\n')
        if (nl === -1) return
        rawLine = buf.slice(0, buf[nl - 1] === '\r' ? nl - 1 : nl)
        buf = buf.slice(nl + 1)
        onenter(rawLine)
      }
    })
  }

  stdin.on('end', onend)

  return input

  function onend () {
    input.emit('end')
  }

  function handle (ch, key) {
    if (key && key.ctrl) {
      if (key.name === 'c' && !input.emit('ctrl-c')) process.exit()
      if (key.name === 'b') moveCursorLeft()
      else if (key.name === 'f') moveCursorRight()
      else if (key.name === 'a') input.cursor = 0
      else if (key.name === 'e') input.cursor = rawLine.length
      else if (key.name === 'u') set('')
      input.emit('ctrl-' + key.name)
      return true
    }

    if (key && key.meta) {
      input.emit('alt-' + key.name)
      return true
    }

    switch (key && key.name) {
      case 'up':
        input.emit('up')
        return true

      case 'down':
        input.emit('down')
        return true

      case 'left':
        moveCursorLeft()
        input.emit('left')
        return true

      case 'right':
        moveCursorRight()
        input.emit('right')
        return true

      case 'backspace':
        rawLine = rawLine.slice(0, Math.max(input.cursor - 1, 0)) + rawLine.slice(input.cursor)
        moveCursorLeft()
        return true

      case 'pageup':
        input.emit('pageup')
        return true

      case 'pagedown':
        input.emit('pagedown')
        return true

      default:
        if (ch === '\t') {
          input.emit('tab')
          return true
        }

        if (ch === '\n' || ch === '\r') {
          onenter(rawLine)
          return false // onenter emits update
        }

        if (ch) {
          rawLine = rawLine.slice(0, input.cursor) + ch + rawLine.slice(input.cursor)
          input.cursor += ch.length
          return true
        }
    }

    return false
  }

  function moveCursorLeft () {
    input.cursor = Math.max(input.cursor - 1, 0)
  }

  function moveCursorRight () {
    input.cursor = Math.min(input.cursor + 1, rawLine.length)
  }

  function lineNoStyle () {
    return rawLine
  }

  function line () {
    if (!style) return rawLine
    return style(
      rawLine.slice(0, input.cursor),
      rawLine.slice(input.cursor, input.cursor + 1),
      rawLine.slice(input.cursor + 1)
    )
  }

  function destroy () {
    input.destroyed = true
    input.emit('destroy')
    if (!showCursor) process.stdout.write('\x1B[?25h')
  }

  function set (line) {
    rawLine = line
    input.cursor = line.length
    input.emit('update')
  }

  function onenter (line) {
    rawLine = ''
    input.cursor = 0
    input.emit('enter', line)
    input.emit('update')
  }

  function onkeypress (ch, key) {
    if (handle(ch, key)) input.emit('update')
    input.emit('keypress', ch, key)
  }

  function hideCursor () {
    process.stdout.write('\x1B[?25l')
    process.on('exit', destroy)
  }
}
