const camelCase = require('lodash/camelCase')
const upperFirst = require('lodash/upperFirst')
const slugify = require('slugify')

export function pascalCase(str) {
  return upperFirst(camelCase(str))
}

export function normalizeName(str) {
  return slugify(str.replace(/\//g, ' '))
}

export function isExcluded(path, excludeArray) {
  if (Array.isArray(excludeArray) && !excludeArray.length) {
    return false
  }

  if (typeof excludeArray === 'string' || excludeArray instanceof RegExp) {
    excludeArray = [excludeArray]
  }

  const result = excludeArray.find((tester) => {
    if (tester instanceof RegExp) {
      return !!path.match(tester)
    }

    return path.includes(tester)
  })

  return !!result
}
