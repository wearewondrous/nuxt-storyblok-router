const camelCase = require('lodash/camelCase')
const upperFirst = require('lodash/upperFirst')
const slugify = require('slugify')

export function pascalCase(str) {
  return upperFirst(camelCase(str))
}

export function normalizeName(str) {
  return slugify(str.replace(/\//g, ' '))
}
