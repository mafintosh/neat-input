var events = require('events')
var keypress = require('keypress')

module.exports = prompt

function prompt (opts) {
  if (!opts) opts = {}

  var style = opts.style
  var showCursor = !!opts.showCursor
  var prompt = new events.EventEmitter()
  var rawLine = ''

  if (!showCursor) hideCursor()

  prompt.cursor = 0
  prompt.line = line
  prompt.rawLine = lineNoStyle
  prompt.enter = onenter
  prompt.set = set
  prompt.destroy = destroy

  keypress(process.stdin)
  process.stdin.setRawMode(true)
  process.stdin.resume()
  process.stdin.on('keypress', onkeypress)

  return prompt

  function handle (ch, key) {
    if (key && key.ctrl) {
      if (key.name === 'c' && !prompt.emit('ctrl-c')) process.exit()
      prompt.emit('ctrl-' + key.name)
      return true
    }

    switch (key && key.name) {
      case 'left':
        prompt.cursor = Math.max(prompt.cursor - 1, 0)
        return true

      case 'right':
        prompt.cursor = Math.min(prompt.cursor + 1, rawLine.length)
        return true

      case 'backspace':
        rawLine = rawLine.slice(0, Math.max(prompt.cursor - 1, 0)) + rawLine.slice(prompt.cursor)
        prompt.cursor = Math.max(prompt.cursor - 1, 0)
        return true

      default:
        if (ch === '\t') {
          prompt.emit('tab')
          return true
        }

        if (ch === '\n' || ch === '\r') {
          onenter(rawLine)
          return false // onenter emits update
        }

        if (ch) {
          rawLine = rawLine.slice(0, prompt.cursor) + ch + rawLine.slice(prompt.cursor)
          prompt.cursor += ch.length
          return true
        }
    }

    return false
  }

  function lineNoStyle () {
    return rawLine
  }

  function line () {
    if (!style) return rawLine
    return style(
      rawLine.slice(0, prompt.cursor),
      rawLine.slice(prompt.cursor, prompt.cursor + 1),
      rawLine.slice(prompt.cursor + 1)
    )
  }

  function destroy () {
    if (!showCursor) process.stdout.write('\x1B[?25h')
  }

  function set (line) {
    rawLine = line
    prompt.cursor = line.length
    prompt.emit('update')
  }

  function onenter (line) {
    rawLine = ''
    prompt.cursor = 0
    prompt.emit('enter', line)
    prompt.emit('update')
  }

  function onkeypress (ch, key) {
    if (handle(ch, key)) prompt.emit('update')
    prompt.emit('keypress', ch, key)
  }

  function hideCursor () {
    process.stdout.write('\x1B[?25l')
    process.on('exit', destroy)
  }
}
