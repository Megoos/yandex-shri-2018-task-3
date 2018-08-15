var assert = require('assert');
const modeSettings = require('./src/mode');

describe('Проверка установки начала и конца промежутка дня', function() {
  describe('Весь день', function() {
    const data = { duration: 5 };
    const result = modeSettings(data);

    it('Начало промежутка', function() {
      assert.equal(0, result.start);
    });

    it('Конец промежутка', function() {
      assert.equal(24, result.end);
    });
  });

  describe('Ночь', function() {
    const data = { duration: 4, mode: 'night' };
    const result = modeSettings(data);

    it('Начало промежутка', function() {
      assert.equal(21, result.start);
    });

    it('Конец промежутка', function() {
      assert.equal(27, result.end);
    });
  });

  describe('День', function() {
    const data = { duration: 6, mode: 'day' };
    const result = modeSettings(data);

    it('Начало промежутка', function() {
      assert.equal(7, result.start);
    });

    it('Конец промежутка', function() {
      assert.equal(15, result.end);
    });
  });
});
