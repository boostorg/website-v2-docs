'use strict'

module.exports = (...args) => {
  const numArgs = args.length
  if (numArgs !== 2) throw new Error('{{json}} helper expects 1 argument')
  return JSON.stringify(args[0], null, 2)
}
