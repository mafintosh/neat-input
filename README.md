# neat-prompt

A diff friendly cli prompt module. Made for usage with neat-log and ansi-diff-stream

```
npm install neat-prompt
```

Very useful if you want to accept interactive user input in an application that does interactive
output (such as writing a progress bar) without messing it up

## Usage

To illustrate what this module does, try running the below example

``` js
var prompt = require('neat-prompt')({style: style})
var diff = require('ansi-diff-stream')()

var names = []
var seconds = 0

diff.pipe(process.stdout)

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
    Welcome to name prompt. It has been ${seconds} since you started.

    Please enter your name: ${prompt.line()}
    Cursor position is ${prompt.cursor}

    Previously entered names: ${names.join(', ')}
  `)
}
```

Notice that as you are inputing a new name the UI is updating and things look the way they are supposed to,
even though the output is being updated both above and below the prompt line.

Try deleting characters using backspace or moving the cursor around with the arrow keys

## API

#### `var prompt = neatPrompt([options])`

Create a prompter. Options include:

``` js
{
  showCursor: false, // set to true to *not* hide the normal cli cursor while running the program
  style: function (start, cursor, end) {} // set to style the line output (default is not style)
}
```

#### `prompt.line()`

Returns the currently inputted line (styled)

#### `prompt.rawLine()`

Returns the line unstyled always.

#### `prompt.set(rawLine)`

Set the internal rawLine to a given string and move the cursor to the end

#### `prompt.cursor`

The current position of the cursor

#### `prompt.enter(rawLine)`

Set the internal rawline and trigger an enter event.

#### `prompt.on('update')`

Emitted everytime the prompt state is updated.

#### `prompt.on('enter', line)`

Emitted when an enter is clicked. Also sets the rawLine to an empty string.

#### `prompt.on('tab')`

Emitted when tab is clicked

#### `prompt.on('ctrl-<key>')`

Emitted when ctrl + some key is pressed.
If you do not provide a handler for ctrl-c the process will be exited for you
on ctrl-c.

#### `prompt.on('keypress', ch, key)`

Forwarded from the keypress module whenever a key is pressed.

## License

MIT
