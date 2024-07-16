'use strict'

module.exports = (obj, field, options) => {
  if (!obj) {
    return obj === null
  }
  field = field.split('.')
  for (let i = 0; i < field.length; i++) {
    if (!Object.prototype.hasOwnProperty.call(obj, field[i])) {
      return undefined
    }
    obj = obj[field[i]]
  }
  return obj
}
