// @author Rob W <http://stackoverflow.com/users/938089/rob-w>
// Demo: var serialized_html = DOMtoString(document);

function getDOMInnerHTML(document_root) {
    var html = '',
        node = document_root.firstChild;
    while (node) {
        switch (node.nodeType) {
        case Node.ELEMENT_NODE:
            var children = node.childNodes;
            for(var i = 0; i < children.length; i++){
                if(children[i].nodeName === 'BODY'){
                    var bodyChildren = children[i].childNodes;
                    for (var j = 0; j < bodyChildren.length; j++) {
                        if(bodyChildren[j].nodeType !== Node.TEXT_NODE && bodyChildren[j].nodeName !== "SCRIPT"){
                            html += bodyChildren[j].innerHTML;
                        }
                    }
                }
            }
            
            break;
        }
        node = node.nextSibling;
    }
    var emoji = checkForEmoji(html);
    if(emoji !== null){
        return emoji;
    }
    return;
}

function checkForEmoji(textToSearch){
  var reg = /[\uD800-\uDBFF]+[\uDC00-\uDFFF]+/g;
  var emojis = textToSearch.match(reg);
  console.log(emojis);
  if(emojis !== null){
    return emojis;
  }
  return;
}

chrome.runtime.sendMessage({
    action: "getEmoji",
    arrayOfEmojis: getDOMInnerHTML(document)
});