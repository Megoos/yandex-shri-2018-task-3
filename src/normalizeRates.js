
// на выходе получаем массив из 24 элементов, у каждого свой коэфицент
module.exports = function(rates) {
  const newRates = [];

  rates.forEach(rate => {
    let i = rate.from;
    do {
      newRates[i] = rate.value;
      i++;
      if (i === 24) {
        i = 0;
      }
    } while (i <= rate.to - 1);
  });

  return newRates;
};
