
// TODO

// add way to interupt sound
// consider an audio 'sprite' file, use Audio.currentTime = valueInSeconds to seek to locations
// maybe find a file with a whole lot of individual sounds,, maybe just cartoon sfx since it is
// emoji melodies (midi melodies would have worked better)

// figure out how to get rhythm working
// figure out how to assign note values (128513 - xxxxxxxx)

// Tables

// 1F601 - 1F64F faces // maybe just deal with faces for now,, or not
// 2702 - 27B0 dingbats
// 1F680 - 1F6C0 transport
// 24C2 - 1F251 characters
// 1F600 - 1F636 emoticons
// 1F30D - 1F567 other additional


// Possible issues:
//		- 	extension will check multiple loaded URLs, sometimes results in extra choppy sounds
// 		-	seems like audio files are loaded extra times for every page reload
// 		-	future :: add listener for AJAX junk maybe

var melodyLengthCap = 80;
var isMelodyPlaying = false;
var myTimer;

function onWindowLoad() {


	chrome.runtime.onMessage.addListener(function(request, sender) {
	  if (request.action == "getEmoji") {
	  	// console.log("playing sound");
	  	// playSound('c',false);
	  	// playSound('d',false);

	  	// Now I need to parse the emoji, I could potentially wrap around as well to increase the
	  	// possible emoji to make the same melody

	  	// Consider which emoji represent the chromatic scale and how many time divisions to create

	  	// console.log(request.arrayOfEmojis);
	  	if(typeof request.arrayOfEmojis !== 'undefined'){
	  		// for (var i = 0; i < request.arrayOfEmojis.length; i++) {
		  	// 	console.log(fixedCharCodeAt(request.arrayOfEmojis[i],0));
		  	// }
		  	console.log("Found: " + request.arrayOfEmojis.length + " in the page");
		  	(function(){
			    var loop = 0;
			    
			    isMelodyPlaying = true;

			    var looper = function(){
			        // console.log('Loop count: ' + loop);
			        if(!isMelodyPlaying){
			        	return;
			        }

			        if (loop < request.arrayOfEmojis.length && loop < melodyLengthCap) {
			        	var code = fixedCharCodeAt(request.arrayOfEmojis[loop],0);
			        	// console.log(code);
			        	playSound(1,(code - 128500)%80,false);

			            loop++;
			        } else {
			            // console.log('Loop end.');
			            stopSound(1);
			            isMelodyPlaying = false;
			            return;
			        }

			        var delay = (code - 128450)*2;
			        // console.log("Delay: " + delay);
			        myTimer = setTimeout(looper, delay);
			    };

			    looper();
			})();
	  	}
	  	

	  }
	});

	chrome.webNavigation.onCompleted.addListener(function(tab) {
		if(isMelodyPlaying){
			clearTimeout(myTimer);
			stopMelody();
		}
		console.log('Checking ' + tab.url + ' for Emoji!');
	    chrome.tabs.executeScript(null, {file: "getPagesSource.js" });
	});

	

}


// *********************************************




// *********************************************


// var mySounds = {
// 	'1':"A.m4a",
// 	'2':"Bb.m4a",
// 	'3':"B.m4a",
// 	'4':"C.m4a",
// 	'5':"Db.m4a",
// 	'6':"D.m4a",
// 	'7':"Eb.m4a",
// 	'8':"E.m4a",
// 	'9':"F.m4a",
// 	'10':"Gb.m4a",
// 	'11':"G.m4a",
// 	'12':"Ab.m4a"
// };

var mySounds = {'1':'sfx.mp3'}; // about 81s

var sounds = {};
var soundLists = [mySounds];

var started = false;

function shouldPlay(id) {
  // Ignore all events until the startup sound has finished.
  if (id != "startup" && !started)
    return false;
  var val = localStorage.getItem(id);
  if (val && val != "enabled") {
    console.log(id + " disabled");
    return false;
  }
  return true;
}

function didPlay(id) {
  if (!localStorage.getItem(id))
    localStorage.setItem(id, "enabled");
}

function playSound(id,newTime,loop) {
  // if (!shouldPlay(id))
  //   return;

  var sound = sounds[id];
  // console.log("playsound: " + id);
  if (sound && sound.src) {
    if (!sound.paused) {
      if (sound.currentTime < 0.2) {
        // console.log("ignoring fast replay: " + id + "/" + sound.currentTime);
        return;
      }
      sound.pause();
    }

    sound.currentTime = newTime;

    if (loop)
      sound.loop = loop;

    // Sometimes, when playing multiple times, readyState is HAVE_METADATA.
    if (sound.readyState == 0) {  // HAVE_NOTHING
      console.log("bad ready state: " + sound.readyState);
    } else if (sound.error) {
      console.log("media error: " + sound.error);
    } else {
      didPlay(id);
      sound.play();
    }
  } else {
    console.log("bad playSound: " + id);
  }
}

function stopSound(id) {
  console.log("stopSound: " + id);
  var sound = sounds[id];
  if (sound && sound.src && !sound.paused) {
    sound.pause();
    sound.currentTime = 0;
  }
}

var notYetLoaded = {};
// var base_url = chrome.extension.getURL;

function loadSound(file, id) {
  if (!file.length) {
    console.log("no sound for " + id);
    return;
  }
  var audio = new Audio();
  audio.id = id;
  audio.onerror = function() { soundLoadError(audio, id); };
  audio.addEventListener("canplaythrough",
      function() { soundLoaded(audio, id); }, false);
  if (id == "startup") {
    audio.addEventListener("ended", function() { started = true; });
  }
  audio.src = file;
  console.log(chrome.extension.getURL(file));
  audio.load();
  notYetLoaded[id] = audio;
}

function soundLoadError(audio, id) {
  console.log("failed to load sound: " + id + "-" + audio.src);
  audio.src = "";
  if (id == "startup")
    started = true;
}

function soundLoaded(audio, id) {
  // console.log("loaded sound: " + id);
  sounds[id] = audio;
  if (id == "startup")
    playSound(id);
}

function stopMelody(){
	console.log('stopping melody');
	isMelodyPlaying = false;
}


for (var list in soundLists) {
  for (var id in soundLists[list]) {
    loadSound(soundLists[list][id], id);
  }
}

// *********************************************




// *********************************************


function fixedCharCodeAt(str, idx) {
  // ex. fixedCharCodeAt('\uD800\uDC00', 0); // 65536
  // ex. fixedCharCodeAt('\uD800\uDC00', 1); // false
  idx = idx || 0;
  var code = str.charCodeAt(idx);
  var hi, low;
  
  // High surrogate (could change last hex to 0xDB7F to treat high
  // private surrogates as single characters)
  if (0xD800 <= code && code <= 0xDBFF) {
    hi = code;
    low = str.charCodeAt(idx + 1);
    if (isNaN(low)) {
      throw 'High surrogate not followed by low surrogate in fixedCharCodeAt()';
    }
    return ((hi - 0xD800) * 0x400) + (low - 0xDC00) + 0x10000;
  }
  if (0xDC00 <= code && code <= 0xDFFF) { // Low surrogate
    // We return false to allow loops to skip this iteration since should have
    // already handled high surrogate above in the previous iteration
    return false;
    /*hi = str.charCodeAt(idx - 1);
    low = code;
    return ((hi - 0xD800) * 0x400) + (low - 0xDC00) + 0x10000;*/
  }
  return code;
}





window.onload = onWindowLoad;