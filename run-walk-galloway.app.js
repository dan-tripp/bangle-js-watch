
let FONT_SIZE_MAIN = 45;

let g_t0 = getTime();

function refreshTimeOfDay() {
	// X/Y are the position of the bottom right of the HH:MM text 
	const x = g.getWidth()/2 + 70;
	let y = 58;

	let d = new Date();
	let hourAndMinuteStr = require("locale").time(d, 1 /*omit seconds*/);
	//hourAndMinuteStr = '21:30'; 

	g.reset();

	g.setFontAlign(1,1); // align bottom right
	g.setFont("Vector", FONT_SIZE_MAIN);
	g.drawString(hourAndMinuteStr, x, y, true /*clear background*/);

}

function refreshTimeElapsed() {
	let timeElapsedInSeconds = Math.floor(getTime() - g_t0);
	let hours = Math.floor(timeElapsedInSeconds / 3600);
	let minutes = Math.floor((timeElapsedInSeconds % 3600) / 60);
	let seconds = timeElapsedInSeconds % 60;

	let hoursAndMinutesAndSecondsStr = `${hours.toString()}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;

	g.reset();

	const x = 9;
	let y = 110;
	g.setFontAlign(-1,1); // align bottom left
	g.setFont("Vector", FONT_SIZE_MAIN);
	g.drawString(hoursAndMinutesAndSecondsStr, x, y, true /*clear background*/);

}

function refreshWalkRunCycleTime() {
	let WALK_SECONDS = 30;
	let RUN_SECONDS = 4*60 + 30;
	WALK_SECONDS = 13; // tdr 
	RUN_SECONDS = 3; // tdr 

	let timeElapsedInSeconds = Math.floor(getTime() - g_t0);
	let walkPlusRunCycleTimeInSeconds = WALK_SECONDS + RUN_SECONDS;
	let timeElapsedInSecondsModCycle = timeElapsedInSeconds % walkPlusRunCycleTimeInSeconds;
	let minutes = Math.floor((timeElapsedInSecondsModCycle % 3600) / 60);
	let seconds = timeElapsedInSecondsModCycle % 60;

	let minutesAndSecondsStr = `${minutes.toString()}:${seconds.toString().padStart(2, "0")}`;

	g.reset();

	let x = 9;
	let y = 162;
	g.setFontAlign(-1,1); // align bottom left
	g.setFont("Vector", FONT_SIZE_MAIN);
	g.drawString(minutesAndSecondsStr, x, y, true /*clear background*/);

	let areWeInWalkNotRun = timeElapsedInSecondsModCycle < WALK_SECONDS;
	let runVsWalkStr = (areWeInWalkNotRun ? 'WALK' : 'RUN') + '     ';
	g.setFontAlign(-1,1);
	g.setFont("Vector", FONT_SIZE_MAIN/2);
	g.drawString(runVsWalkStr, x+100, y-10, true /*clear background*/);

	let WALK_END_BUZZ_SECONDS = 10;
	let areWeNearTheEndOfWalkCycle = timeElapsedInSecondsModCycle >= WALK_SECONDS - WALK_END_BUZZ_SECONDS && timeElapsedInSecondsModCycle < WALK_SECONDS; 
	if(areWeNearTheEndOfWalkCycle) {
		buzz();
	} else {
		let RUN_END_BUZZ_SECONDS = 10;
		let areWeNearTheEndOfRunCycle = timeElapsedInSecondsModCycle >= walkPlusRunCycleTimeInSeconds - RUN_END_BUZZ_SECONDS; 
	}

}

function buzz() {
	let numBuzzes = 2;
	let intervalId;
	function buzzOnce() {
		if(numBuzzes <= 0) {
			clearInterval(intervalId);
		} else {
			numBuzzes--;
			Bangle.buzz(300, 1);
		}
	}
	intervalId = setInterval(buzzOnce, 500);
}

function refreshAll() {
	refreshTimeOfDay();
	refreshTimeElapsed();
	refreshWalkRunCycleTime();
}

g.clear();
refreshAll();
setInterval(refreshAll, 1000);

