/*************************
    Generators as sources
**************************/

// (Some) Integers
const intGen = function * (start=0, end=Infinity, stride=1) {
    let i = start;
    while (i <= end) {
        yield i;
        i += stride;
    }
}

// Collection of nth first iterable elements
//(Source: http://exploringjs.com/es6/ch_generators.html#sec_examples-of-generators)
const take = function * (iterable, n=1) {
    for (const x of iterable) {
        if (n <= 0) return;
        n--;
        yield x;
    }
}

// Object to help with time units
// TODO: refactor as a class?
export const unitsHelper = {
	// 8 Date units of time. No 's'. "day" will be replaced by "date"
	units: ["millisecond", "second", "minute", "hour", "day", "date", "month", "year"],
	getIndex: (unit = "millisecond") => unitsHelper.units.indexOf(unit),
	isFound:  (unit = "millisecond") => unitsHelper.units.indexOf(unit) > -1,
	
	// Edit unit's name to make it start with an uppercase and finish with a 's', if needed
	upperCaseAndPlural: (unit = "millisecond") => {
		const units = unitsHelper.units;
		const index = unitsHelper.getIndex(unit);

		// Handle invalid 
		if (index === -1) throw `Invalid unit: \'${unit}\'. \n Valid units list: ${units.map(uStr => uStr + ' ,' ).toString}.`;

		// Uppercase the first letter
		const str = units[index][0].toUpperCase() + units[index].substring(1);
		
		if (index >= 0 && index <= 3) return  str + "s";	// Only the 4th first units need a final s
		if (index > 3 && index < 7) return str;						// No `s` for those
		if (index === 7) return "Full" + str;							// `get/setFullYear()` special case
	},
	// Build out the name of the setter and the getter. For `day`, use `getDate()` and `setDate()`.
	setgetName: (unit = "millisecond", prefix = "set") => {
		if(!unitsHelper.isFound(unit)) return undefined;
		
		// Special case: `setDate` of days
		if(unit === "day") unit = "date"
		return prefix + unitsHelper.upperCaseAndPlural(unit)
	},
	// Toolbox of shortcuts
	tb: (unit = "millisecond") =>
		({
			isFound: unitsHelper.isFound(unit),
			getterName: unitsHelper.setgetName(unit, "get"),
			setterName: unitsHelper.setgetName(unit),
		})
};

// Yield past or forthcoming dates from a given one, accordingly a step {unit, gap} and up to a certain limit {unit, span}. Works with 'millisecond', 'second', 'minute', 'hour', 'day', 'date', 'month' and 'year'.
// Requires `unitsHelper` object
// TODO: use generator's `throw` when implemented
export const stepInTime = (direction = "backward") => (
	constrainTo = { unit: "hour", span: 1 },
	step = { unit: "minute", gap: 1 },
	fomatFunc = d => d.toLocaleTimeString()
) => function*(date = new Date()) {
		
		// ⚠ No throwing exception at the moment inside generators
		if (!["backward", "forward"].includes(direction)) {
			console.warn(`Invalid direction \'${direction}\' reset to default 'backward'. \n Valid direction: 'backward', 'forward'`);
			direction = "backward";
		}
		
		if (constrainTo != undefined && !unitsHelper.isFound(constrainTo.unit)){
			console.warn(`Inccorect constraining unit \'${constrainTo.unit}\' reset to default 'hour'. \n Valid units: 'millisecond', 'second', 'minute', 'hour', 'day', 'date', 'month', 'year'`);
			constrainTo.unit = "hour"
		}
		
		if (!unitsHelper.isFound(step.unit)){
			console.warn(`Inccorect working unit \'${step.unit}\' reset to default 'minute'. \n Valid units: 'millisecond', 'second', 'minute', 'hour', 'day', 'date', 'month', 'year'`);
			step.unit = "minute";
		}
		
		if (constrainTo != undefined && unitsHelper.getIndex(constrainTo.unit) < unitsHelper.getIndex(step.unit)) {
			console.warn(`Incompatible constraining and working unitsConstraining: ${constrainTo.unit} < ${step.unit} reset to defaults: \n constrainTo.unit = 'hour', \n step.unit = 'minute'`);
			constrainTo.unit = "hour";
			step.unit = "minute";
		}
		
		// Set the direction of the steps
		const dirFactor = (direction === "backward") ? -1 : 1;
		
		// If `constrainTo` object as been passed, load the toolbox for the constraining unit
		const cnstrUnitHelpers = constrainTo ? unitsHelper.tb(constrainTo.unit) : undefined;
		// Load the toolbox for the working unit
		const stepUnitHelpers = unitsHelper.tb(step.unit);

		// If `constrainTo` object as been passed, set the `limit` according to the direction
		let limit = undefined;
		if(constrainTo && dirFactor < 0) { limit = date[cnstrUnitHelpers.getterName]() }
		if(constrainTo && dirFactor > 0) { limit = date[cnstrUnitHelpers.getterName]() + 1 }
		
		const currDate = date;
		
		// Define the test for the `while()` loop: either test the `lowerLimit` if any, or loop infinitly
		const test = () => {
			// Constrained generator
			if(limit) {
				// Stepping backward, `limit` is a lower limit
				if(dirFactor < 0) return currDate[cnstrUnitHelpers.getterName]() >= limit 
				// Stepping forward, `limit` is an upper limit
				if(dirFactor > 0) return currDate[cnstrUnitHelpers.getterName]() <= limit 
			
			// Un-constrained generator
			return true;
		}
		
		while (test()) {
			// Yield `currDate` using the provided Date format function
			yield fomatFunc(currDate);
			const currUnitVal = currDate[stepUnitHelpers.getterName]();
			// Decrement `currDate` working unit of one step back
			currDate[stepUnitHelpers.setterName](currUnitVal + dirFactor * step.gap);
		}
	};

export const stepInPast = stepInTime("backward");
export const stepInFuture = stepInTime("forward");

// // Example
// const daysOfMonth = stepInFuture
// ({unit: "month", span: 1},
// {unit: "day", gap: 3},
// d => d.toString())

// // Example 1
// const daysOfCurrentMonth = daysOfMonth()

// // Example 2
// const then = new Date('August 19, 1975 23:15:30');
// const daysOfMonthBackThen = daysOfMonth(then)

// console.clear();
// for(const entry of daysOfCurrentMonth) {
//  	console.log(entry)
// }
// console.log('-----------------------')
// for(const entry of daysOfMonthBackThen) {
//  	console.log(entry)
// }


/*************************
    Generators as sinks
**************************/


export {intGen as default, take}