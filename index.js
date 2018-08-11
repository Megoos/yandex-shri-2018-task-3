const fs = require('fs');
const normalizeRates = require('./src/normalizeRates');
const modeSettings = require('./src/mode');
const validator = require('./src/validator');

const _path = './data/input.json';
const rounding = 4;

function main() {
  const result = {
    schedule: {},
    consumedEnergy: {
      value: 0,
      devices: {}
    }
  };

  // массив для хранения информации о текущей мощности на каждом промежутке времени
  const arrayCheckMaxPower = [];

  // Заполняем расписание начальными данными
  for (let index = 0; index < 24; index++) {
    result.schedule[index] = [];
    arrayCheckMaxPower[index] = 0;
  }

  try {
    // читаем из файла исходные данные
    const {devices, rates, maxPower} = JSON.parse(fs.readFileSync(_path));

    // сортируем устройства, от самого потребляемого до менее потребляемого
    devices.sort(function(a, b) {
      return b.duration * b.power - a.duration * a.power;
    });

    // нормализуем промежутки времени
    const normRates = normalizeRates(rates);

    devices.forEach(device => {
      // получаем настройки дня
      const mode = modeSettings(device);

      let timeFrom = 0;
      let timeTo = 0;
      let minPwr = Infinity;

      for (let i = mode.start; i <= mode.end; i++) {
        let spacerTo = device.duration + i;
        let intervalRate = 0;

        if (spacerTo > 24) {
          spacerTo -= 24;
          intervalRate = [...normRates.slice(i, 24), ...normRates.slice(0, spacerTo)];
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
        const powerHours = +((intervalRate.reduce((a, b) => a + b) * device.power) / 1000).toFixed(rounding);

        if (powerHours < minPwr) {
          minPwr = powerHours;
          timeFrom = i;
          timeTo = spacerTo - 1;
        }
      }
      // console.log(minPwr, timeFrom, timeTo);

      result.consumedEnergy.value = +(result.consumedEnergy.value + minPwr).toFixed(rounding);
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
