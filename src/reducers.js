// Regroupe array item two by two (as long as possible)
// https://stackoverflow.com/questions/31352141/how-do-you-split-an-array-into-array-pairs-in-javascript
export const pairing = (result, value, index, array) => {
    if (index % 2 === 0)
      result.push(array.slice(index, index + 2));
    return result;
  }

// Keep the longest element (length property required)
export const longest = (a, b) => a.length > b.length ? a : b