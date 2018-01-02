var prompt = require('./')({style: style})
var diff = require('ansi-diff-stream')()

var names = []
var seconds = 0

diff.pipe(process.stdout)

prompt.on('end', function () {
  process.exit()
})

prompt.on('enter', function (line) {
  names.push(line)
})

setInterval(function () {
  seconds++
  update()
}, 1000)

prompt.on('update', update)
update()

function style (start, cursor, end) {
  if (!cursor) cursor = ' '
  return start + '[' + cursor + ']' + end
}

function update () {
  diff.write(`
    Welcome to name prompt. It has been ${seconds} second(s) since you started.

    Please enter your name: ${prompt.line()}
    Cursor position is ${prompt.cursor}

    Previously entered names: ${names.join(', ')}
  `)
}
