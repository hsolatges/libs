/* Provide named function for usual operators
    (useful for shortcuts in Array.reduce() and Array.map() for instance...)
*/

import applyOnIters from './arrays-toolbox.js'

/***********************
 * Extended operations *
 ***********************/
export const add = (init=0) => (...args) => args.reduce((a,b) => a+b, init)
export const addStr = add('') // Special case to concatenate strings
export const addNbr = add(0) // Special case to add numbers

export const sub = (...args) => args.reduce((a,b) => a-b, 0)
export const mul = (...args) => args.reduce((a,b) => a*b, 1)
export const div = (...args) => args.reduce((a,b) => (b) ? a/b : a, 1)

/*************
 * Functions *
 *************/
// Identity
export const id = (x=0) => x;

// Dot product
export const dotprod = (...args) => addNbr(...applyOnIters(mul, 0)(...args))