chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {

    // would do something here, probably insert the audio tag
        // var audioElement = document.createElement('audio');
        // audioElement.setAttribute('src', '1.wav');
        // audioElement.load()
        // audioElement.addEventListener("load", function() { 
        //   audioElement.play();
        // }, true);

        console.log("cool");
    // sendResponse(myFunc(request.args));
});


chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    console.log(sender.tab ?
                "from a content script:" + sender.tab.url :
                "from the extension");
    if (request.greeting == "hello"){
        // var audioElement = document.createElement('audio');
        // audioElement.setAttribute('src', '1.wav');
        // audioElement.load()
        // audioElement.addEventListener("load", function() { 
        //   audioElement.play();
        // }, true);
        
        sendResponse({farewell: "goodbye"});
    }
  });