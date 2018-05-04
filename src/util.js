module.exports.check = (value, type, {
  required = false,
  name = ''
} = {}) => {
  if ((type === String && typeof(value) !== 'string') && !(value instanceof type)) {
    throw new TypeError(`${name || value} is not an instance of type ${type.name}`)
  }

  if (required && !value) {
    throw new TypeError(`${name || 'field'} is required`)
  }
}
