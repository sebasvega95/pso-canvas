// Schaffer function
function f(x, y) {
  return 0.5 - (Math.pow(Math.sin(Math.sqrt(x*x + y*y)), 3) - 0.5) / Math.pow(1 + 0.001 * (x*x + y*y), 2);
}
