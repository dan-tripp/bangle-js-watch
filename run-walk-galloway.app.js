
let FONT_SIZE_MAIN = 45;
let DRAW_INTERVAL_MILLIS = 500;
let END_SEGMENT_BUZZ_PHASE_1_SECONDS = 10, END_SEGMENT_BUZZ_PHASE_2_SECONDS = 2;

function repeat(array_, numTimes_) {
  let r = [];
  for (let i = 0; i < numTimes_; i++) {
    for (let j = 0; j < array_.length; j++) {
      r.push(array_[j]);
    }
  }
  return r;
}

let RUN_NAME_TO_SEGMENTS = {};

RUN_NAME_TO_SEGMENTS["scratch"] = [{str: 'MARAPACE', seconds: 45}];

RUN_NAME_TO_SEGMENTS["0:30/4:30"] = [{str: 'WALK', seconds: 30}, {str: 'RUN', seconds: 4*60 + 30}];

{
	let walkSeconds = 45;
	RUN_NAME_TO_SEGMENTS["Week 13 Run 2"] = [].concat(
		repeat([
			{str: 'WALK', seconds: 30}, 
			{str: 'EASY', seconds: 4*60 + 30}, 
		], 2), 

		repeat([
			{str: 'WALK', seconds: walkSeconds}, 
			{str: 'TEMPO', seconds: 5*60}, 
			{str: 'JOG', seconds: 2*60 - walkSeconds}, 
		], 5), 
		
		repeat([
			{str: 'WALK', seconds: 30}, 
			{str: 'EASY', seconds: 4*60 + 30}, 
		], 2), 

		repeat([
			{str: 'OVER', seconds: 9*60 + 59}
		], 99)
	);
};

RUN_NAME_TO_SEGMENTS["Week 12 Run 2"] = [].concat(
	repeat([
		{str: 'WALK', seconds: 30}, 
		{str: 'EASY', seconds: 4*60 + 30}, 
	], 1), 

	repeat([
		{str: 'WALK', seconds: 30}, 
		{str: 'MARAPACE', seconds: 4*60 + 30}, 
	], 8), 

	repeat([
		{str: 'WALK', seconds: 30}, 
		{str: 'EASY', seconds: 4*60 + 30}, 
	], 1), 

	repeat([
		{str: 'OVER', seconds: 9*60 + 59}
	], 99)
);

RUN_NAME_TO_SEGMENTS["Week 11 Run 3"] = [].concat(
	repeat([
		{str: 'WALK', seconds: 30}, 
		{str: 'EASY', seconds: 4*60 + 30}, 
	], 2), 

	repeat([
		{str: 'WALK', seconds: 30}, 
		{str: 'MARAPACE', seconds: 4*60 + 30}, 
	], 6), 

	repeat([
		{str: 'WALK', seconds: 30}, 
		{str: 'EASY', seconds: 4*60 + 30}, 
	], 2), 

	repeat([
		{str: 'OVER', seconds: 9*60 + 59}
	], 99)
);

function drawTimeOfDay() {
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

function drawSegmentTimeAndStr(segments_) {
	drawSegmentTimeAndStrImpl(segments_, getTime());
}

function getCurSegmentInfo(segments_, curTime_) {
	let timeElapsedInSeconds = Math.floor(curTime_ - g_t0);
	let curSegmentIdx = 0, secondsIntoCurSegment = timeElapsedInSeconds;
	while(true) {
		let curSegmentLenSeconds = segments_[curSegmentIdx % segments_.length].seconds;
		if(secondsIntoCurSegment < curSegmentLenSeconds) {
			break;
		}
		secondsIntoCurSegment -= curSegmentLenSeconds;
		curSegmentIdx++;
	}
	return {curSegmentIdx, secondsIntoCurSegment};
}

function getMinutesColonSecondsStrFromSeconds(seconds_) {
	let countDownMinutesToDisplay = Math.floor(seconds_ / 60);
	let countDownSecondsToDisplay = seconds_ - countDownMinutesToDisplay*60;
	let r = `${countDownMinutesToDisplay.toString()}:${countDownSecondsToDisplay.toString().padStart(2, "0")}`;
	return r;
}

function drawSegmentTimeAndStrImpl(segments_, curTime_) {
	let _ = getCurSegmentInfo(segments_, curTime_), curSegmentIdx = _.curSegmentIdx, secondsIntoCurSegment = _.secondsIntoCurSegment;
	let curSegment = segments_[curSegmentIdx % segments_.length];
	let secondsRemainingInCurSegment = curSegment.seconds - secondsIntoCurSegment;

	let countDownMinutesAndSecondsStr = getMinutesColonSecondsStrFromSeconds(secondsRemainingInCurSegment);

	g.reset();

	let x = 5;
	let y = 162;
	g.setFontAlign(-1,1); // align bottom left
	g.setFont("Vector", FONT_SIZE_MAIN);
	g.drawString(countDownMinutesAndSecondsStr, x, y, true /*clear background*/);

	g.setFontAlign(-1, 0); // align center left 
	x = 103;
	y = 141;
	let str = curSegment.str;
	if(str.length == 5) {
		str = str.slice(0, 3) + '\n ' + str.slice(3); // eg. "TEMPO" becomes "TEM\n PO" (i.e. "center-justified" the second line, for appearances). 
	} else if(str.length > 5) {
		str = str.slice(0, 4) + '\n' + str.slice(4);
	}
	g.setFont("Vector", FONT_SIZE_MAIN*55/100);
	g.drawString(str, x, y, true /*clear background*/);

}

function scheduleEndSegmentPhase1Buzzer(segmentEndTimeInEpochSeconds_) {
	let buzzPhase1StartTimeInEpochSeconds = segmentEndTimeInEpochSeconds_ - END_SEGMENT_BUZZ_PHASE_1_SECONDS;
	let buzzPhase1DurationInSeconds = END_SEGMENT_BUZZ_PHASE_1_SECONDS - END_SEGMENT_BUZZ_PHASE_2_SECONDS;
	let buzzPhase1StartTimeInSecondsFromCurTime = buzzPhase1StartTimeInEpochSeconds - getTime();
	function doBuzzesForPhase1() {
		function buzzOnce() {
			Bangle.buzz(300, 10);
		}
		buzzOnce();
		let buzzPeriodInSeconds = 0.5, numBuzzesRemaining = Math.floor(buzzPhase1DurationInSeconds/buzzPeriodInSeconds);
		let intervalId;
		function buzzIntervalFunc() {
			buzzOnce();
			numBuzzesRemaining--;
			if(numBuzzesRemaining == 0) {
				clearInterval(intervalId);
			}
		}
		intervalId = setInterval(buzzIntervalFunc, buzzPeriodInSeconds*1000);
	}
	setTimeout(doBuzzesForPhase1, buzzPhase1StartTimeInSecondsFromCurTime*1000);
}

function scheduleEndSegmentPhase2Buzzer(segmentEndTimeInEpochSeconds_) {
	let buzzPhase2StartTimeInEpochSeconds = segmentEndTimeInEpochSeconds_ - END_SEGMENT_BUZZ_PHASE_2_SECONDS;
	let buzzPhase2StartTimeInSecondsFromCurTime = buzzPhase2StartTimeInEpochSeconds - getTime();
	function doBuzzForPhase2() {
		Bangle.buzz(END_SEGMENT_BUZZ_PHASE_2_SECONDS*1000, 10);
	}
	setTimeout(doBuzzForPhase2, buzzPhase2StartTimeInSecondsFromCurTime*1000);
}

/* @param iSegment_ can be bigger than segments_.length.  we'll mod it if necessary. */
function scheduleEndSegmentBuzzers(segments_, segmentIdx_) {
	let segmentEndTimeInEpochSeconds = g_t0;
	for(let iSegment=0; iSegment<=segmentIdx_; iSegment++) {
		segmentEndTimeInEpochSeconds += segments_[iSegment % segments_.length].seconds;
	}
	scheduleEndSegmentPhase1Buzzer(segmentEndTimeInEpochSeconds);
	scheduleEndSegmentPhase2Buzzer(segmentEndTimeInEpochSeconds);

	let segmentEndTimeInSecondsFromCurTime = segmentEndTimeInEpochSeconds - getTime();
	setTimeout(() => {scheduleEndSegmentBuzzers(segments_, segmentIdx_+1);}, segmentEndTimeInSecondsFromCurTime*1000);

}

function drawAll(segments_) {
	g.clear();
	drawTimeOfDay();
	drawTimeElapsed();
	drawSegmentTimeAndStr(segments_);
}

function startRunByName(runName_) {
	let segments = RUN_NAME_TO_SEGMENTS[runName_];
	startRunBySegments(segments);
}

function startRunBySegments(segments_) {
	g_t0 = getTime();
	drawAll(segments_);
	setInterval(() => {drawAll(segments_);}, DRAW_INTERVAL_MILLIS);
	scheduleEndSegmentBuzzers(segments_, 0);
}

function getWalkPercentageFromSegments(segments_) {
	let walkSecondsTally = 0, runSecondsTally = 0;
	for(let segment of segments_) {
		if(segment.str === 'OVER') {
			break;
		} else if(segment.str === 'WALK') {
			walkSecondsTally += segment.seconds;
		} else {
			runSecondsTally += segment.seconds;
		}
	}
	let r = (100*walkSecondsTally/(walkSecondsTally+runSecondsTally)).toFixed(1);
	return r;
}

function getTotalMinutesFromSegments(segments_) {
	let secondsTally = 0;
	for(let segment of segments_) {
		if(segment.str === 'OVER') {
			break;
		} else {
			secondsTally += segment.seconds;
		}
	}
	let minutesTally = secondsTally/60;
	return minutesTally;
}

let g_t0;

let isRunningUnderNode = typeof process !== "undefined"  && process.versions != null && process.versions.node != null;

if(isRunningUnderNode) {

	if(process.argv[2] === '--scratch') { // i.e. run this: node run-walk-galloway.app.js --scratch 


	} else if(process.argv.length == 2) { // ==> no args ==> print info about programmed runs 
		let runNames = Object.keys(RUN_NAME_TO_SEGMENTS);
		for(let i = runNames.length-1; i >= 0 ; i--) {
			let runName = runNames[i];
			let segments = RUN_NAME_TO_SEGMENTS[runName];
			let walkPercentage = getWalkPercentageFromSegments(segments);
			let totalMinutes = getTotalMinutesFromSegments(segments);
			console.log(`${runName}:`);
			for(let segment of segments) {
				if(segment.str === 'OVER') break;
				console.log(`\t${segment.str} ${getMinutesColonSecondsStrFromSeconds(segment.seconds)}`);
			}
			console.log(`\t${JSON.stringify({walkPercentage, totalMinutes}, null, 0)}`);
		}
	} else {
		throw new Error('unknown args');
	}
	process.exit();
}

let testingOnWatch = false;
if(testingOnWatch) {
	END_SEGMENT_BUZZ_PHASE_1_SECONDS = 4;
	END_SEGMENT_BUZZ_PHASE_2_SECONDS = 2;

	let segments = [].concat(
		repeat([
			{str: 'TEMPO', seconds: 6}, 
			{str: 'TEMPO2', seconds: 6}, 
			{str: 'JOG', seconds: 6}, 
			{str: 'RUN', seconds: 6}, 
			{str: 'FAST', seconds: 6}, 
			{str: 'WALK', seconds: 6}, 
		], 1), 

		repeat([
			{str: 'OVER', seconds: 9*60 + 59}
		], 99)
	);

	startRunBySegments(segments);
} else {
	let menuStrToFunc = {};
	let runNames = Object.keys(RUN_NAME_TO_SEGMENTS);
	for(let i = 0; i < runNames.length; i++) {
		let runName = runNames[i];
		menuStrToFunc[runName] = () => {
			E.showPrompt(`Starting ${runName}`, {buttons : {"Ok": true}}).then(function() {
				startRunByName(runName);
			});
		};
	}
	E.showMenu(menuStrToFunc);
}

