const Gpio = require('./gpio');
const extend = require('extend');

class FanSpeed {
  constructor(config) {
    this.speed = 0;
    this.currentState = 0;

    this.settings = extend({
      min: 10,
      max: 50,
      scale: 1,
		base: 0.2,
      pollInterval: 100
    }, config);

    if (Gpio) {
      this.gpio = new Gpio(config.gpio.pin, 'out');

            this.gnd = new Gpio(config.gpio.gnd, 'out');
            this.gnd.writeSync(0);

            this.onTimeout(0);
    }
  }

  getFanSpeed(watts) {
    
	if(watts<50)
		return 0;
	
	if(watts<100)
		return 1;
	
	if(watts>=100)
		return 2;
  }

  onTimeout(outVal) {
    let nextTime = this.settings.pollInterval,
      nextVal = outVal;

    if (this.currentState === 0) {
      outVal = 0;
      nextVal = 0;
    }
    else if (this.currentState === 1) {
      outVal = 1;
      nextVal = 1;
    } else {
      nextTime = this.settings.pollInterval * ((outVal === 0) ? 1 - this.currentState : this.currentState);
      nextVal = 1 - outVal;
    }

    setTimeout(() => this.onTimeout(nextVal), nextTime);

    if (this.gpio) {
      this.gpio.writeSync(outVal);
    } else {
      process.stdout.write(outVal.toString());
    }
  }

  setState(speed) {
    //this.speed = speed;
    this.currentState = this.getFanSpeed(speed);
	console.log(`Fan statuts: ${this.currentState}`);
    /*if (!this.gpio) {
      console.log(`Fan speed0 ${this.currentState}`);
    }*/
	
    return this.currentState;
  }

  getState() {
    return { speed: this.speed, fan: this.currentState };
  }

  disconnect() {
    this.speed = 0;
    if (!this.gpio) {
      this.gpio.unexport();
      this.gpio = null;
            this.gnd.unexport();
            this.gnd = null;
    }
  }
}
module.exports = FanSpeed;
