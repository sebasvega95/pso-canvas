// Shubert function
function f(x, y) {
  var sum1 = 0, sum2 = 0;
  for (var i = 1; i <= 5; i++) {
    sum1 += i * Math.cos((i + 1) * x + i);
    sum2 += i * Math.cos((i + 1) * y + i);
  }
  return sum1 * sum2;
}
