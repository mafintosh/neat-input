# neat-input

A diff friendly cli input module. Made for usage with neat-log and ansi-diff-stream

[![Build Status](https://travis-ci.org/mafintosh/neat-input.svg?branch=master)](https://travis-ci.org/mafintosh/neat-input)

```
npm install neat-input
```

Very useful if you want to accept interactive user input in an application that does interactive
output (such as writing a progress bar) without messing it up

## Usage

To illustrate what this module does, try running the below example

``` js
var input = require('neat-input')({style: style})
var diff = require('ansi-diff-stream')()

var names = []
var seconds = 0

diff.pipe(process.stdout)

input.on('enter', function (line) {
  names.push(line)
})

setInterval(function () {
  seconds++
  update()
}, 1000)

input.on('update', update)
update()

function style (start, cursor, end) {
  if (!cursor) cursor = ' '
  return start + '[' + cursor + ']' + end
}

function update () {
  diff.write(`
    Welcome to name input. It has been ${seconds} since you started.

    Please enter your name: ${input.line()}
    Cursor position is ${input.cursor}

    Previously entered names: ${names.join(', ')}
  `)
}
```

Notice that as you are inputing a new name the UI is updating and things look the way they are supposed to,
even though the output is being updated both above and below the input line.

Try deleting characters using backspace or moving the cursor around with the arrow keys

## API

#### `var input = neatPrompt([options])`

Create a prompter. Options include:

``` js
{
  showCursor: false, // set to true to *not* hide the normal cli cursor while running the program
  style: function (start, cursor, end) {} // set to style the line output (default is not style)
}
```

#### `input.line()`

Returns the currently inputted line (styled)

#### `input.rawLine()`

Returns the line unstyled always.

#### `input.set(rawLine)`

Set the internal rawLine to a given string and move the cursor to the end

#### `input.cursor`

The current position of the cursor

#### `input.enter(rawLine)`

Set the internal rawline and trigger an enter event.

#### `input.on('update')`

Emitted everytime the input state is updated.

#### `input.on('enter', line)`

Emitted when an enter is clicked. Also sets the rawLine to an empty string.

#### `input.on('tab')`

Emitted when tab is clicked

#### `input.on('up')`

Emitted when the up key is clicked

#### `input.on('down')`

Emitted when the down key is clicked

#### `input.on('left')`

Emitted when the left key is clicked

#### `input.on('right')`

Emitted when the right key is clicked

#### `input.on('space')`

Emitted when the space key is clicked

#### `input.on('backspace')`

Emitted when the backspace key is clicked

#### `input.on('pageup')`

Emitted when page up is clicked

#### `input.on('pagedown')`

Emitted when page down is clicked

#### `input.on('ctrl-<key>')`

Emitted when ctrl + some key is pressed.
If you do not provide a handler for ctrl-c the process will be exited for you
on ctrl-c.

#### `input.on('alt-<key>')`

Emitted when alt + some key is pressed.

#### `input.on('shift-<key>')`

Emitted when shift + some control key is pressed.

#### `input.on('keypress', ch, key)`

Forwarded from the keypress module whenever a key is pressed.

## Shortcuts

When typing on the command line, `neat-input` supports the following shortcuts:

* `ctrl-a` move the cursor to the beginning of the line
* `ctrl-e` move the cursor to the end of the line
* `ctrl-b` move the cursor one character to the left
* `ctrl-f` move the cursor one character to the right
* `ctrl-k` erase all characters to the right of the cursor
* `ctrl-u` erase the whole line
* `ctrl-w` erase one word to the left of the cursor
* `alt-backspace` same as `ctrl-w`
* `alt-d` erase one word to the right of the cursor
* `alt-b` move the cursor one word to the left
* `alt-f` move the cursor one word to the right

## License

MIT
