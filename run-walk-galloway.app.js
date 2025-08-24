
let FONT_SIZE_MAIN = 45;
let REFRESH_INTERVAL_MILLIS = 500;

let g_t0 = getTime();

function refreshTimeOfDay() {
	// X/Y are the position of the bottom right of the HH:MM text 
	const x = g.getWidth()/2 + 70;
	let y = 58;

	let d = new Date(); 	
	let hourAndMinuteStr = require("locale").time(d, 1 /*omit seconds*/);

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
	let WALK_SORTOF_NEAR_END_BUZZ_SECONDS = 10, WALK_VERY_NEAR_END_BUZZ_SECONDS = 2;
	let RUN_SORTOF_NEAR_END_BUZZ_SECONDS = 10, RUN_VERY_NEAR_END_BUZZ_SECONDS = 2;

	let testing = false;
	if(testing) {
		WALK_SECONDS = 15;
		RUN_SECONDS = 15;
		WALK_SORTOF_NEAR_END_BUZZ_SECONDS = 10;
		RUN_SORTOF_NEAR_END_BUZZ_SECONDS = 10;
	}

	let timeElapsedInSeconds = Math.floor(getTime() - g_t0);
	let WALK_PLUS_RUN_SECONDS = WALK_SECONDS + RUN_SECONDS;
	let timeElapsedInSecondsModCycle = timeElapsedInSeconds % WALK_PLUS_RUN_SECONDS;
	let areWeInWalkNotRun = timeElapsedInSecondsModCycle < WALK_SECONDS;
	let countDownSecondsToDisplay = areWeInWalkNotRun 
		? WALK_SECONDS - timeElapsedInSecondsModCycle 
		: WALK_PLUS_RUN_SECONDS - timeElapsedInSecondsModCycle;
	let countDownMinutes = Math.floor((countDownSecondsToDisplay % 3600) / 60);
	let countDownSeconds = countDownSecondsToDisplay % 60;

	let countDownMinutesAndSecondsStr = `${countDownMinutes.toString()}:${countDownSeconds.toString().padStart(2, "0")}`;

	g.reset();

	let x = 9;
	let y = 162;
	g.setFontAlign(-1,1); // align bottom left
	g.setFont("Vector", FONT_SIZE_MAIN);
	g.drawString(countDownMinutesAndSecondsStr, x, y, true /*clear background*/);

	let runVsWalkStr = (areWeInWalkNotRun ? 'WALK' : 'RUN') + '     ';
	g.setFontAlign(-1,1);
	g.setFont("Vector", FONT_SIZE_MAIN/2);
	g.drawString(runVsWalkStr, x+100, y-10, true /*clear background*/);

	if(areWeInWalkNotRun) {
		let areWeNearTheEndOfWalkCycle = timeElapsedInSecondsModCycle >= WALK_SECONDS - WALK_SORTOF_NEAR_END_BUZZ_SECONDS;
		if(areWeNearTheEndOfWalkCycle) {
			let areWeVeryNearEnd = timeElapsedInSecondsModCycle >= WALK_SECONDS - WALK_VERY_NEAR_END_BUZZ_SECONDS;
			if(areWeVeryNearEnd) {
				buzzForVeryNearEndOfCycle();
			} else {
				buzzForSortofNearEndOfCycle();
			}
		}
	} else {
		let areWeNearTheEndOfRunCycle = timeElapsedInSecondsModCycle >= WALK_PLUS_RUN_SECONDS - RUN_SORTOF_NEAR_END_BUZZ_SECONDS; 
		if(areWeNearTheEndOfRunCycle) {
			let areWeVeryNearEnd = timeElapsedInSecondsModCycle >= WALK_PLUS_RUN_SECONDS - WALK_VERY_NEAR_END_BUZZ_SECONDS;
			if(areWeVeryNearEnd) {
				buzzForVeryNearEndOfCycle();
			} else {
				buzzForSortofNearEndOfCycle();
			}
		}
	}

}

function buzzForVeryNearEndOfCycle() {
	Bangle.buzz(REFRESH_INTERVAL_MILLIS, 1);
}

function buzzForSortofNearEndOfCycle() {
	Bangle.buzz(300, 10);
}

function refreshAll() {
	refreshTimeOfDay();
	refreshTimeElapsed();
	refreshWalkRunCycleTime();
}

g.clear();
refreshAll();
setInterval(refreshAll, REFRESH_INTERVAL_MILLIS);

