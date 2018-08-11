const fs = require('fs');
const normalizeRates = require('./src/normalizeRates');
const modeSettings = require('./src/mode');
const validator = require('./src/validator');

const inputPath = './data/input.json';
const outputPath = './data/output.json';
const rounding = 4;

function main() {
  // структура результата
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
    const {devices, rates, maxPower} = JSON.parse(fs.readFileSync(inputPath));

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

        if (spacerTo > 24) spacerTo -= 24;

        // проверка не превышает ли maxPower на каком-то промежутке времени
        let exit = false;
        let indexCheckFrom = i;
        do {
          if (indexCheckFrom === 24) {
            indexCheckFrom = 0;
          }
          if (arrayCheckMaxPower[indexCheckFrom] + device.power > maxPower) {
            exit = true;
            break;
          }

          indexCheckFrom++;
        } while (indexCheckFrom < spacerTo);

        if (exit) continue;

        // получаем интервал для промежутка времени
        const intervalRate =
          device.duration + i > 24
            ? [...normRates.slice(i, 24), ...normRates.slice(0, spacerTo)]
            : normRates.slice(i, spacerTo);

        // вычисляем затраты на потребление электроэнергии
        const powerHours = +((intervalRate.reduce((a, b) => a + b) * device.power) / 1000).toFixed(rounding);

        // если затраты меньше текущих запоминаем промежуток времени
        if (powerHours < minPwr) {
          minPwr = powerHours;
          timeFrom = i;
          timeTo = spacerTo - 1;
        }
      }

      // записываем информацию об устройстве в результаты
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

    // записываем результаты в файл
    fs.writeFileSync(outputPath, JSON.stringify(result));
  } catch (e) {
    console.log(e);
  }
}

main();
