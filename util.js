exports.findWordBeginBackward = function (line, cursor) {
  while (cursor > 0 && line[cursor - 1] === ' ') cursor--
  while (cursor > 0 && line[cursor - 1] !== ' ') cursor--
  return cursor
}

exports.findWordEndForward = function (line, cursor) {
  while (cursor < line.length && line[cursor] === ' ') cursor++
  while (cursor < line.length && line[cursor] !== ' ') cursor++
  return cursor
}
