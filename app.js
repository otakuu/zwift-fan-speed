const ZwiftAccount = require('zwift-mobile-api'), settings = require('./settings');
	
var Gpio = require('onoff').Gpio; 
var RELAISPOWER = new Gpio(4, 'out'); 
var RELAISLEVEL = new Gpio(3, 'out'); 

const account = new ZwiftAccount(settings.username, settings.password);

let interval, playerProfile, errorCount

console.log('zwiffer started...');

startWaitPlayer();

function startWaitPlayer() {
    startInterval(checkPlayerStatus, settings.statusInterval || 10000);
}

function startMonitorSpeed(profile) {
	
    console.log('Start monitoring rider speed');

    playerProfile = profile
    errorCount = 0;

    startInterval(checkPlayerSpeed, settings.interval || 2000);
}

function startInterval(callbackFn, timeout) {
    if (interval) clearInterval(interval);
    interval = setInterval(callbackFn, timeout);
    callbackFn();
}

function checkPlayerStatus() {
    account.getProfile(settings.player).profile()
        .then(profile => {

            if (profile.riding) {
                console.log(`Player ${settings.player} has started riding`);
                startMonitorSpeed(profile);
            } else {
                console.log(`Player ${settings.player} is not riding`);
				console.log('Try one of those: ');
				
				var world = account.getWorld(1);

				world.riders().then(riders => {
					console.log(riders.friendsInWorld[0].playerId); // JSON array of all riders currently riding
					console.log(riders.friendsInWorld[1].playerId); // JSON array of all riders currently riding
					console.log(riders.friendsInWorld[2].playerId); // JSON array of all riders currently riding
				});

            }
        })
        .catch(err => {
            console.log(`Error getting player status: ${err.response.status} - ${err.response.statusText}`);
        });
}

function checkPlayerSpeed() {
    account.getWorld(playerProfile.worldId).riderStatus(settings.player)
        .then(status => {

            if (!status || status.speed === undefined) {
                console.log('Invalid rider status');
                speedCheckError();
            } else {
                errorCount = 0;
                const speedkm = Math.round((status.speed / 1000000));
                console.log(`Distance: ${status.distance}m, Time: ${status.time}secs, Speed: ${speedkm}km/h, Watts: ${status.power}w`);
				
                var fanState = getFanSpeed(status.power);
				console.log('fanState: '+fanState)
				
				if(fanState==0){
					RELAISLEVEL.writeSync(0);
					RELAISPOWER.writeSync(0);
				}
				
				if(fanState==1){
					RELAISLEVEL.writeSync(0);
					RELAISPOWER.writeSync(1);
				}
				
				if(fanState==2){
					RELAISLEVEL.writeSync(1);
					RELAISPOWER.writeSync(1);
				}
            }
        })
        .catch(err => {
            console.log(`Error getting rider speed: ${err.response.status} - ${err.response.statusText}`);
            speedCheckError();
        });
}

function speedCheckError() {
    errorCount++;
    if (errorCount >= 3) {
        fanSpeed.setState(0);
        startWaitPlayer();
	}
}
	
function getFanSpeed(watts) {
	if(watts<settings.fanLevel0)
		return 0;
	
	if(watts<settings.fanLevel1)
		return 1;
	
	if(watts>=settings.fanLevel1)
		return 2;
}
