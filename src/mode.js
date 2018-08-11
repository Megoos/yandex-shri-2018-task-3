// вычисление конфигурации для определенного промежутка дня
module.exports = function(device) {
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

  return {start, end};
};
