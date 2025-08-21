
// first here is the Font7x11Numeric7Seg.js file (from https://www.espruino.com/modules/Font7x11Numeric7Seg.js), inlined, and slightly modified in the "exports" part: 

/* Copyright (c) 2018 Gordon Williams, Pur3 Ltd. See the file LICENSE for copying permission. */
/* 7 segment 7x11 font - only '-.0123456789ABCDEF' */
/*
// Magic 7 segment font maker
var W = 7; // width +1 for empty column
var WC = 5; // width of colon
var Ht = 11;
var H;
var base = `
 aaaa
f    b
f..  b
f..  b
f    b
 gggg
e    c
e..  c
e..  c
e    c
odddd `;

var digits = [
// 0x0,                 // space
 0x40, // dash
 0x100,// dot
 0x3F,0x06,0x5B,0x4F, // 0123
 0x66,0x6D,0x7D,0x07, // 4567
 0x7F,0x6F,           // 89
 0x80,                 // :
 0x77,0x7C,           // Ab
 0x39,0x5E,0x79,0x71  // cdef
];
var widths = [W,0,0,0,0,0,0,0,0,0,0,0,0,W, // space ... -
           2,0,W,W,W,W,W, // ./0123...
           W,W,W,W,W,WC,
           0,0,0,0,0,0,
           W,W,W,W,W,W];
function drawCh(g,n,x,y) {
 var b = base;
 var d = digits[n];
 b = b.replace(/a/g,(d&1)?"#":" ");
 b = b.replace(/b/g,(d&2)?"#":" ");
 b = b.replace(/c/g,(d&4)?"#":" ");
 b = b.replace(/d/g,(d&8)?"#":" ");
 b = b.replace(/e/g,(d&16)?"#":" ");
 b = b.replace(/f/g,(d&32)?"#":" ");
 b = b.replace(/g/g,(d&64)?"#":" ");
 b = b.replace(/\./g,(d&128)?"#":" ");
 b = b.replace(/o/g,(d&256)?"#":" ");
 g.drawImage(Graphics.createImage(b),x,y);
}

var gr = Graphics.createArrayBuffer(Ht,E.sum(widths),1,{msb:true});
gr.setRotation(3,1);
var y = widths[0]; // space & full stop
for (var i=0;i<digits.length;i++) {
  drawCh(gr,i,y,0);
  if (digits[i]==0x100) y+=2; // dot
  else y += (digits[i]==0x80) ? WC : W;
}
gr.setRotation(0);
var font = E.toString(gr.asImage().buffer);
widths = E.toString(widths);
g.setFontCustom(font, 32, widths, 256|Ht);
g.drawString("0 12345.6789-:ABCDEF",20,20);
console.log(g.stringWidth("012345.6789:ABCDEF"));
g.flip();
print('this.setFontCustom(atob('+JSON.stringify(btoa(font))+
     '), 32, atob('+JSON.stringify(btoa(widths))+
     '), '+Ht+');');
*/
Font7x11Numeric7Seg = {add: function(graphics) {
  graphics.prototype.setFont7x11Numeric7Seg = function() {
    return this.setFontCustom(atob("AAAAAAAAAAAAAAAEAIAQAgAAAAAIAHvQBgDAGAL3gAAAAAAAAAAHvAAA9CGEMIYQvAAAACEMIYQwhe8AB4AIAQAgBA94ADwIQwhhDCEDwAHvQhhDCGEIHgAAAgBACAEAHvAAe9CGEMIYQveAA8CEMIYQwhe8AAABjDGAAAA96EEIIQQge8AB7wIQQghBCB4AD3oAwBgDAEAAAAPAhBCCEEL3gAPehDCGEMIQAAAe9CCEEIIQAAAA"), 32, atob("BwAAAAAAAAAAAAAAAAcCAAcHBwcHBwcHBwcFAAAAAAAABwcHBwcH"), 11);
  }
}}

// end of Font7x11Numeric7Seg.js 

Font7x11Numeric7Seg.add(Graphics);
//console.log(Graphics.prototype.getFonts()); // tdr 


let g_t0 = getTime();

function drawTimeOfDay() {
	// X/Y are the position of the bottom right of the HH:MM text 
	const x = g.getWidth()/2 + 55;
	let y = 55;

	let d = new Date();
	let hourAndMinuteStr = require("locale").time(d, 1 /*omit seconds*/);
	//hourAndMinuteStr = '21:30'; 

	g.reset();

	g.setFontAlign(1,1); // align bottom right
	g.setFont("7x11Numeric7Seg:4");
	g.drawString(hourAndMinuteStr, x, y, true /*clear background*/);

	let drawSeconds = false;
	if(drawSeconds) {
		g.setFontAlign(-1,1); // align bottom left
		g.setFont("7x11Numeric7Seg:2");
		let secondsStr = d.getSeconds().toString().padStart(2,0);
		g.drawString(secondsStr, x+2, y, true /*clear background*/);
	}
}

function drawTimeElapsed() {
	// X/Y are the position of the bottom right of the HH:MM text 
	const x = g.getWidth()/2 + 55;
	let y = 110;

	let timeElapsedInSeconds = Math.floor(getTime() - g_t0);
	let hours = Math.floor(timeElapsedInSeconds / 3600);
	let minutes = Math.floor((timeElapsedInSeconds % 3600) / 60);
	let seconds = timeElapsedInSeconds % 60;

	let hourAndMinuteStr = `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;

	g.reset();

	g.setFontAlign(1,1); // align bottom right
	g.setFont("7x11Numeric7Seg:4");
	g.drawString(hourAndMinuteStr, x, y, true /*clear background*/);

	g.setFontAlign(-1,1); // align bottom left
	g.setFont("7x11Numeric7Seg:2");
	g.drawString(seconds.toString().padStart(2, "0"), x+2, y, true);
}

function drawWalkRunCycleTime() {
	const WALK_SECONDS = 30;
	const RUN_SECONDS = 4*60 + 30;

	// X/Y are the position of the bottom right of the HH:MM text 
	const x = g.getWidth()/2 + 55;
	let y = 165;

	let timeElapsedInSeconds = Math.floor(getTime() - g_t0);
	let hours = Math.floor(timeElapsedInSeconds / 3600);
	let minutes = Math.floor((timeElapsedInSeconds % 3600) / 60);
	let seconds = timeElapsedInSeconds % 60;

	let hourAndMinuteStr = `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;

	g.reset();

	g.setFontAlign(1,1); // align bottom right
	g.setFont("7x11Numeric7Seg:4");
	g.drawString(hourAndMinuteStr, x, y, true /*clear background*/);

	g.setFontAlign(-1,1); // align bottom left
	g.setFont("7x11Numeric7Seg:2");
	g.drawString(seconds.toString().padStart(2, "0"), x+2, y, true);
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