
const { MODES, SENSORS } = require('./constants');

module.exports.getTimestamp = (date = new Date()) => {
    const year = date.getFullYear();
    const month = date.getMonth() + 1 <= 9 ? `0${date.getMonth() + 1}` : date.getMonth() + 1;
    const day = date.getDate();
    const hours = date.getHours() <= 9 ? `0${date.getHours()}` : date.getHours();
    const minutes = date.getMinutes() <= 9 ? `0${date.getMinutes()}` : date.getMinutes();
    const seconds = date.getSeconds() <= 9 ? `0${date.getSeconds()}` : date.getSeconds();
  
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  };
  
module.exports.modeToValue = value => {
    let mode;
    if (value === MODES.COMFORT) {
      mode = 0;
    } else if (value === MODES.AUTO) {
      mode = 1;
    } else if (value === MODES.DAY_OR_NIGHT) {
      mode = 2;
    }
    return mode;
  }
  
module.exports.valueToMode = mode => {
    let value;
    if (mode === 0) {
      value = MODES.COMFORT;
    } else if (mode === 1) {
      value = MODES.AUTO;
    } else if (mode === 2) {
      value = MODES.DAY_OR_NIGHT;
    }
    return value;
  }

module.exports.getStatus = status => {
    const statusSplit = status.split(',');
    // status[0] = 1564834881996 => time
    // status[1] = 1 => is_on (hvac)
    // status[2] = 26.5 => measure_temperature
    // status[3] = 16.0 => target_temperature
    // status[4] = 0 =>
    // status[5] = 1 => away
    // status[6] = 1 =>
    // status[7] = 0 =>
    // status[8] = 0 =>
    // status[9] = 1 => mode
    // status[10] = 05 =>
    // status[11] = 35 =>
  
    return {
      time: new Date(Number(statusSplit[0])),
      onoff: statusSplit[1] === '1' ? true : false,
      measure_temperature: parseFloat(statusSplit[2]),
      target_temperature: parseFloat(statusSplit[3]),
      away: statusSplit[5] === '1' ? true : false,
      mode: Number(statusSplit[9]),
    };
  };

