const fs = require('fs');

const _path = './data/input.json';

function validator(data) {
  console.log(data);
}

function checkMinCost(rates, rateFrom, rateTo, sumPower) {
  console.log(sumPower);
}

function normalizeRates(rates) {
  let newRates = [];

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
}

function main() {
  let schedule = {};

  try {
    const { devices, rates, maxPower } = JSON.parse(fs.readFileSync(_path));

    devices.sort(function(a, b) {
      return b.duration * b.power - a.duration * a.power;
    });

    const normRates = normalizeRates(rates);

    devices.forEach(device => {
      let mode = 24;
      let timeFrom = 0;
      let timeTo = 0;
      let minPwr = Infinity;

      for (let i = 0; i <= 24; i++) {
        let spacerTo = device.duration + i;
        let intervalRate = 0;

        if (spacerTo > 23) {
          spacerTo -= 24;

          intervalRate = [
            ...normRates.slice(i, 24),
            ...normRates.slice(0, spacerTo)
          ];
        } else {
          intervalRate = normRates.slice(i, spacerTo);
        }

        // кв/ч
        const powerHours = (
          (intervalRate.reduce((a, b) => a + b) * device.power) /
          1000
        ).toFixed(2);

        if (powerHours < minPwr) {
          minPwr = powerHours;
          timeFrom = i;
          timeTo = spacerTo;
        }
      }

      console.log(minPwr, timeFrom, timeTo);
    });
    console.log(devices);

    // devices.map(device => {
    //   const rate = rates.find(item => {
    //     let interval = item.to - item.from;

    //     if (interval < 0) {
    //       interval += 24;
    //     }

    //     return device.duration <= interval;
    //   });

    //   console.log(rate);
    // });

    console.log(schedule);
    // const ouput = JSON.stringify(inputData);
    // fs.writeFileSync('data/output_new.json', ouput);
  } catch (e) {
    console.log(e);
  }
}

main();
