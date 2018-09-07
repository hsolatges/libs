// Interpolation functions f:[0,1]→[0,1]
const lerp = (t=.5) => (1 - t) * a + t * b;
const smoothstep1 = (t=.5) => t**2*(3-2*t);
const smoothstep2 = (t=.5) => t**3*(t*(6*t-15)+10);
const smoothstep3 = (t=.5) => t**4*(20*t**3+70*t**2-84*t+35);
//const smoothstep = (n=0) => (t=.5) => ___

// TODO: TEST THIS
// Extends prior functions' domain
const mapInterp = (f=lerp) => (b=1, a=0) => (x=.5*(a+b)) => f((x-a)/(b-a))*(b-a)+a;

export {lerp as default, smoothstep1, smoothstep2, smoothstep3, mapInterp}