
let FONT_SIZE_MAIN = 45;
let DRAW_INTERVAL_MILLIS = 500;
let END_SEGMENT_BUZZ_PHASE_1_SECONDS = 10, END_SEGMENT_BUZZ_PHASE_2_SECONDS = 2;

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

function drawSegmentTimeAndStrImpl(segments_, curTime_) {
	let _ = getCurSegmentInfo(segments_, curTime_), curSegmentIdx = _.curSegmentIdx, secondsIntoCurSegment = _.secondsIntoCurSegment;
	let curSegment = segments_[curSegmentIdx % segments_.length];
	let secondsRemainingInCurSegment = curSegment.seconds - secondsIntoCurSegment;

	let countDownMinutesToDisplay = Math.floor(secondsRemainingInCurSegment / 60);
	let countDownSecondsToDisplay = secondsRemainingInCurSegment - countDownMinutesToDisplay*60;

	let countDownMinutesAndSecondsStr = `${countDownMinutesToDisplay.toString()}:${countDownSecondsToDisplay.toString().padStart(2, "0")}`;

	g.reset();

	let x = 9;
	let y = 162;
	g.setFontAlign(-1,1); // align bottom left
	g.setFont("Vector", FONT_SIZE_MAIN);
	g.drawString(countDownMinutesAndSecondsStr, x, y, true /*clear background*/);

	g.setFontAlign(-1,1);
	g.setFont("Vector", FONT_SIZE_MAIN/2);
	g.drawString(curSegment.str, x+100, y-10, true /*clear background*/);

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

function start_30_430() {
	let segments = [{str: 'WALK', seconds: 30}, {str: 'RUN', seconds: 4*60 + 30}];
	startForSegments(segments);
}

function repeat(array_, numTimes_) {
  let r = [];
  for (let i = 0; i < numTimes_; i++) {
    for (let j = 0; j < array_.length; j++) {
      r.push(array_[j]);
    }
  }
  return r;
}

function startWeek8Run2() {
	let segments = [].concat(
		repeat([
			{str: 'WALK', seconds: 30}, 
			{str: 'RUN', seconds: 4*60 + 30}, 
		], 2), 

		repeat([
			{str: 'FAST', seconds: 90}, 
			{str: 'JOG', seconds: 70}, 
			{str: 'WALK', seconds: 20}, 
		], 10), 

		repeat([
			{str: 'WALK', seconds: 30}, 
			{str: 'RUN', seconds: 4*60 + 30}, 
		], 2), 

		repeat([
			{str: 'OVER', seconds: 9*60 + 59}
		], 99)
	);
	startForSegments(segments);
}

function startForSegments(segments_) {
	g_t0 = getTime();
	drawAll(segments_);
	setInterval(() => {drawAll(segments_);}, DRAW_INTERVAL_MILLIS);
	scheduleEndSegmentBuzzers(segments_, 0);
}

let g_t0;

let isRunningUnderNode = typeof process !== "undefined"  && process.versions != null && process.versions.node != null;
let testingOnWindows = isRunningUnderNode;

if(testingOnWindows) {

	g_t0 = 1756722879.741;
	for(let curTimeRelative = 1; curTimeRelative < 240*60; curTimeRelative += 1) {
		let segments = [{str: 'WALK', seconds: 30}, {str: 'RUN', seconds: 4*60 + 30}];
		let {curSegmentIdx, secondsIntoCurSegment} = getCurSegmentInfo(segments, g_t0 + curTimeRelative);
		let minutesIntoCurSegment = secondsIntoCurSegment/60;
		console.log(new Date(), "", JSON.stringify({curTime: curTimeRelative, curSegmentIdx, minutesIntoCurSegment}, null, 0));
	}

	process.exit();
}

let testingOnWatch = false;
if(testingOnWatch) {
	END_SEGMENT_BUZZ_PHASE_1_SECONDS = 4;
	END_SEGMENT_BUZZ_PHASE_2_SECONDS = 2;

	let segments = [].concat(
		repeat([
			{str: 'FAST', seconds: 6}, 
			//{str: 'JOG', seconds: 6}, 
			//{str: 'WALK', seconds: 6}, 
		], 1), 

		repeat([
			{str: 'OVER', seconds: 9*60 + 59}
		], 99)
	);

	startForSegments(segments);
} else {
	E.showMenu({
		"0:30/4:30" : () => {
			E.showPrompt("Starting 0:30/4:30", {buttons : {"Ok": true}}).then(function() {
				start_30_430();
			});
		}, 
		"Week 8 Run 2" : () => {
			E.showPrompt("Starting Week 8 Run 2", {buttons : {"Ok": true}}).then(function() {
				startWeek8Run2();
			});
		}, 
	});
}

