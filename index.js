const fs = require('fs');

const path = './data/input.json';

function validator(data) {
  console.log(data);
}

function main() {
  let schedule = {};

  try {
    const { devices, rates, maxPower } = JSON.parse(fs.readFileSync(path));

    rates.sort(function(a, b) {
      return a.value - b.value;
    });

    devices.map(device => {
      const rate = rates.find(item => {
        let interval = item.to - item.from;

        if (interval < 0) {
          interval += 24;
        }

        return device.duration <= interval;
      });

      console.log(rate);
    });

    console.log(schedule);
    // const ouput = JSON.stringify(inputData);
    // fs.writeFileSync('data/output_new.json', ouput);
  } catch (e) {
    console.log(e);
  }
}

main();
