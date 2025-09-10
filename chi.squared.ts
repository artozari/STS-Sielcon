export const chiSquaredConstantExpected = (
  observed: number[],
  expectedValue: number
): number => {
  console.log("Valor esperado:", expectedValue.toFixed(4));

  const cuad: number = observed.reduce((sum, obs) => {
    return sum + Math.pow(obs - expectedValue, 2);
  }, 0);

  return cuad / expectedValue;
};

const average = (valores: number[]): number => {
  const total = valores.reduce((sum, val) => sum + val, 0);
  return total / valores.length;
};
