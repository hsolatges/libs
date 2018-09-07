/**********************
 * On generic objects * 
***********************/
// Object ↦ Object | Recursively deep copy an object
//(Source: https://stackoverflow.com/a/23536726)
export const deepCopy = (object) => {
	let res = Array.isArray(object) ? [] : {};
	for (const key of object.keys()) {
		const value = object[key];
		res[key] = (typeof value === "object" && value !== null) ? deepCopy(value) : value;
	}
	return res;
}


/*********************
 * On generic arrays * 
**********************/
// Zip over the longest iterable provided
//(Source: https://stackoverflow.com/a/10284006)
export const zipLongest = (fill=null) => (...args) => {
	args = Array.from(args).map(arg => Array.from(arg))
	const longest = args.reduce((a,b) => a.length > b.length ? a : b, []);
	return args.length > 0 ? longest.map((_,i) => args.map( arr => arr[i] ? arr[i] : fill)) : []
}

// Map f over zipLongest-ed iterables filled with f neutral element
export const applyOnIters = (f=x=>x, neutral=0) => (...iters) => zipLongest(neutral)(...iters).map(zipped => f(...zipped))

// Arr ↦ Arr | Recursively flatten a give array
export const flatten = arr => arr.reduce((acc, el) => acc.concat(Array.isArray(el) ? flatten(el) : el), []);


/******************************
 * On arrays of summable type *
 ******************************/
// Arr ↦ Arr | Return the prefix sum filled array
export const prefixSum = a => a.map((_, i) => a.slice(0, i+1).reduce(sum));


/**********************
 * On arrays of arays *
 **********************/
//TODO: refactoring, documentation
const equalArrScal = (arr1, arr2) => arr1.length === arr2.length && arr1.every((value, index) => value === arr2[index]);
const haveSharedEl = (arr1, arr2) => arr1.every((e, i) => Array.isArray(e[0]) ? haveSharedEl(e, arr2[i]) : (arr1.length === arr2.length && e === arr2[i]));
const difference = (arr1, arr2) => arr1.filter(e1 => !arr2.some(e2 => haveSharedEl(e1, e2)))
const common = (arr1, arr2) => arr1.filter(e1 => arr2.some(e2 => haveSharedEl(e1, e2)))