
let FONT_SIZE_MAIN = 45;

let g_t0 = getTime();

function drawTimeOfDay() {
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

function drawTimeElapsed() {
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

function drawWalkRunCycleTime() {
	let WALK_SECONDS = 30;
	let RUN_SECONDS = 4*60 + 30;
	WALK_SECONDS = 2; // tdr 
	RUN_SECONDS = 3; // tdr 

	let timeElapsedInSeconds = Math.floor(getTime() - g_t0);
	let walkPlusRunCycleTimeInSeconds = WALK_SECONDS + RUN_SECONDS;
	let timeElapsedInSecondsModCycle = timeElapsedInSeconds % walkPlusRunCycleTimeInSeconds;
	let minutes = Math.floor((timeElapsedInSecondsModCycle % 3600) / 60);
	let seconds = timeElapsedInSecondsModCycle % 60;

	let minutesAndSecondsStr = `${minutes.toString()}:${seconds.toString().padStart(2, "0")}`;

	g.reset();

	let x = 3;
	let y = 165;
	g.setFontAlign(-1,1); // align bottom left
	g.setFont("Vector", FONT_SIZE_MAIN);
	g.drawString(minutesAndSecondsStr, x, y, true /*clear background*/);

	let areWeInWalkNotRun = timeElapsedInSecondsModCycle < WALK_SECONDS;
	let runVsWalkStr = (areWeInWalkNotRun ? 'WALK' : 'RUN') + '     ';
	g.setFontAlign(-1,1);
	g.setFont("Vector", FONT_SIZE_MAIN/2);
	g.drawString(runVsWalkStr, x+5, y-10, true /*clear background*/);



}

function drawAll() {
	drawTimeOfDay();
	drawTimeElapsed();
	drawWalkRunCycleTime();
}

g.clear();
drawAll();
var secondInterval = setInterval(drawAll, 1000);

//Bangle.loadWidgets();
//Bangle.drawWidgets();