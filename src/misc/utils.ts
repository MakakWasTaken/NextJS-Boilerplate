/**
 * Converts a string to title case
 * @param str The string to convert
 * @returns The converted string
 */
export const toTitleCase = (str: string): string => {
  const s = str.replace(/([A-Z])/g, ' $1').trim()
  return s
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim()
}

export const removeUnneededKeys = (object: any, validKeys: string[]) => {
  const tmpObject = object

  for (const objKey in object) {
    if (!validKeys.includes(objKey)) {
      tmpObject[objKey] = undefined
    } else {
      // Format the item
      if (typeof tmpObject[objKey] === 'string') {
        if (!tmpObject[objKey]) {
          // If the string is in some way empty, remove it.
          tmpObject[objKey] = undefined
        } else {
          // If it is present, trim it.
          tmpObject[objKey] = tmpObject[objKey].trim()
        }
      }
    }
  }

  // Convert to json and back, because undefined does not exist in JSON format.
  return JSON.parse(JSON.stringify(tmpObject))
}
