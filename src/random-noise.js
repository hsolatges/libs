/********
 * PRNG *
 ********/
// (number, number) ↦ number | Return a pseudo-random number between `min` (included) and `max` 
export const rFloat = (max=1, min=0) => () => Math.random() * (max - min) + min;

// (number, number) ↦ number | Return a pseudo-random integer between `min` and `max` (both included)
export const rInt = (max=1, min=0) => () => Math.floor(Math.random() * (max - min + 1) + min)

/********************
 * Noise Generators *
 ********************/

// TODO: REFACTORING FOR IMPORT/EXPORT
import * as interpol from './interpolations.js'
import dotprod from './operators.js'
import pairing from './reducers.js'

// Gradient vectors: vectors from the center of a unit cube to its edges 
const gradVect = [
    [1,1,0],[-1,1,0],[1,-1,0],[-1,-1,0],  
    [1,0,1],[-1,0,1],[1,0,-1],[-1,0,-1],  
    [0,1,1],[0,-1,1],[0,1,-1],[0,-1,-1],
    [1,1,0],[-1,1,0],[1,-1,0],[-1,-1,0]	// Extended to 4^2=16 as suggester by K. Perlin
]

// Create a lookup table used for hash function's permutations (256 values between 0 and 255, no duplicate)
const pMaker = () => {
    let s = new Set();
    while(s.size != 256) {
        s.add(rInt(255))
    }
    return Uint8Array.from(s)
}
//const p = [28,4,211,219,6,3,185,19,52,139,122,91,1,153,47,251,22,39,252,141,133,226,32,70,77,7,179,23,220,228,56,104,218,109,34,27,237,17,171,25,55,162,107,78,87,106,5,188,240,146,207,85,136,63,161,53,105,95,33,101,163,182,82,40,198,247,246,72,172,190,245,135,61,48,170,199,197,102,166,24,31,35,54,203,66,42,205,229,209,111,119,20,21,150,193,173,96,212,210,50,74,62,115,116,152,49,65,221,59,128,81,142,71,124,154,44,69,213,38,242,11,196,181,36,178,204,14,176,83,230,8,148,167,143,160,250,144,145,192,10,45,98,238,206,149,155,164,157,235,80,43,200,68,130,2,184,243,137,0,57,177,108,26,110,46,67,15,225,58,215,125,79,76,236,159,89,120,232,241,51,253,84,147,224,231,94,114,60,100,92,227,112,13,169,187,138,223,186,9,129,86,123,121,217,239,151,90,189,64,126,244,194,175,233,234,16,140,208,248,37,201,165,134,18,255,214,75,41,93,191,216,132,118,73,131,117,254,168,30,249,99,127,195,29,12,113,103,202,180,174,158,88,222,156,97,183]
// OR
const p = pMaker()

const p3d = (x, y, z, fadeFunc = interpol.smoothstep2) => {
    const vertices =[ // 8 vertices of the unit cube surrounding the point
        [0,0,0],
        [1,0,0],
        [0,1,0],
        [1,1,0],
        [0,0,1],
        [1,0,1],
        [0,1,1],
        [1,1,1]
    ]
    const cell = [x,y,z].map(v => v & 255)	// Unit cube capturing the point (x,y,z)
    const relCoord = opArr([x,y,z], [x,y,z].map(Math.floor), subtract) // Relative coordinates inside the cell (decimal parts)
    const innerDistVect = vertices
    // Calcul the distance (v-p) to each vertex
    .map(vrtx => opArr(relCoord, vrtx, subtract))
    
    // Perlin's hashing function
    const hashingFunc = (x,y,z) => {
        return p[p[p[x]+y]+z]
    }
    
    // Calculate the dot product of each chosen gradient vector and its matching innerDistVector
    const influences = vertices
    // Pass the cell's coordinates for hashing
    .map(vrtx => hashingFunc(...opArr(cell, vrtx, add)))
    // Use 4 last bits to choose 8 gradient vectors among the 16.
    .map(hash => gradVect[hash & 0xF])
    // Calcul the dot product gradV/dist to the cell's vertices  
    .map((gradVect, i) => dotprod(gradVect, innerDistVect[i]))
    
    // Reducing steps
    const faded = relCoord.map(rlCrd => interpFunc[fadeFunc](rlCrd))
    const lerpValues = influences
    .reduce(pairing, [])
    .map(lrpMnMx => interpFunc['lerp'](...lrpMnMx, faded[0])) // Lerp on the xs
    .reduce(pairing, [])
    .map(lrpMnMx => interpFunc['lerp'](...lrpMnMx, faded[1])) // Lerp on the ys
    
    return .5  * (1 + interpFunc['lerp'](...lerpValues, faded[2]))  // Lerp on the zs and return a number in [0;1]
}

// TODO: REFACTOR FOR ...coords
// Octaves (from: http://flafla2.github.io/2014/08/09/perlinnoise.html)
const octaves = (perlin=p3d, octaves=1, persistence=1, ...coord=[0,0,0]) => {
    let total = 0;
    let frequency = 1;
    let amplitude = 1;
    let maxValue = 0;  // Used for normalizing result to 0.0 - 1.0
    for(i = 0; i < octaves; i++) {
        total += perlin(x * frequency, y * frequency, z * frequency) * amplitude;
        maxValue += amplitude;
        amplitude *= persistence;
        frequency *= 2;
    }

    return total/maxValue;
}