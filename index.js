const fs = require('fs');

const _path = './data/input.json';

function validator(data) {
  console.log(data);
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
  const result = {
    schedule: {},
    consumedEnergy: {
      value: 0,
      devices: {}
    }
  };

  const arrayCheckMaxPower = [];

  for (let index = 0; index < 24; index++) {
    result.schedule[index] = [];
    arrayCheckMaxPower[index] = 0;
  }

  try {
    const { devices, rates, maxPower } = JSON.parse(fs.readFileSync(_path));

    devices.sort(function(a, b) {
      return b.duration * b.power - a.duration * a.power;
    });

    const normRates = normalizeRates(rates);

    devices.forEach(device => {
      let start = 0;
      let end = 24;
      switch (device.mode) {
        case 'day':
          start = 7;
          end = 21 - device.duration;
          break;

        case 'night':
          start = 21;
          end = 31 - device.duration;
          break;

        default:
          break;
      }

      if (device.duration === 24) {
        end = 1;
      }

      let timeFrom = 0;
      let timeTo = 0;
      let minPwr = Infinity;

      for (let i = start; i <= end; i++) {
        let spacerTo = device.duration + i;
        let intervalRate = 0;

        if (spacerTo > 24) {
          spacerTo -= 24;
          intervalRate = [
            ...normRates.slice(i, 24),
            ...normRates.slice(0, spacerTo)
          ];
        } else {
          intervalRate = normRates.slice(i, spacerTo);
        }

        let exit = false;
        let indexCheckFrom = i;
        do {
          if (indexCheckFrom === 24) {
            indexCheckFrom = 0;
          }
          if (arrayCheckMaxPower[indexCheckFrom] + device.power > maxPower) {
            exit = true;
            indexCheckFrom++;
            break;
          }

          indexCheckFrom++;
        } while (indexCheckFrom < spacerTo);

        if (exit) {
          continue;
        }

        // кв/ч
        const powerHours = parseFloat(
          (
            (intervalRate.reduce((a, b) => a + b) * device.power) /
            1000
          ).toFixed(2)
        );

        if (powerHours < minPwr) {
          minPwr = powerHours;
          timeFrom = i;
          timeTo = spacerTo - 1;
        }
      }
      // console.log(minPwr, timeFrom, timeTo);

      result.consumedEnergy.value += minPwr;
      result.consumedEnergy.devices[device.id] = minPwr;

      do {
        if (timeFrom === 24) {
          timeFrom = 0;
        }
        result.schedule[timeFrom].push(device.id);
        arrayCheckMaxPower[timeFrom] += device.power;
        timeFrom++;
      } while (timeFrom !== timeTo + 1);
    });

    // console.log(devices);

    console.log(result);
    console.log(arrayCheckMaxPower);
    // const ouput = JSON.stringify(result);
    // fs.writeFileSync('data/output_new.json', ouput);
  } catch (e) {
    console.log(e);
  }
}

main();
