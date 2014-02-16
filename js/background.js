function getElementHash(el, tag)
{
    var hashKey = "H";
    var hashContent = $.trim(el.html());
    
    if (hashContent === "")
    {
        hashContent = getElementAttributes(el);        
        if (hashContent !== "")
            hashKey = "A";
        else
            hashKey = "";
    }
    
    if (hashKey !== "")
        return(tag + ":" + hashKey + ":" + getHash(hashContent));
    else
        return "";
}

function getElementAttributes(el)
{
   var allAttribs = el[0].attributes;
    attribs = "";
    for(var i=0;i<allAttribs.length;i++) { 
        attribs += allAttribs[i].nodeName + "-" + allAttribs[i].nodeValue + ";";
    }
    
    return attribs;
}

function getElementByHash(hashValue)
{
    var el = null;
    var frags = hashValue.split(":");
    if (frags.length !== 3)
        return null;
    else
    {
        var tag = frags[0];
        var hashKey = frags[1];
        var hash = parseInt(frags[2]);

        $("#main " + tag).each(function() {
            if (hashKey == "H")
            {
                if ((getHash($(this).html()) - hash) == 0)
                {
                    el = $(this);
                    return false;
                }
            }
            else
            {
          
                if ((getHash(getElementAttributes($(this))) - hash) == 0)
                {
                    el = $(this);
                    return false;
                }                    
            }
        });
    }
    return el;
}

function getHash(s) {
        var hash = 0;
        for (var i = 0; i < s.length; i++) {
                hash = parseInt(s.charCodeAt(i)) + ( parseInt(hash << 5) - parseInt(hash) );
        }
        return hash;
}

var clickHandler = function(info, tab) {
    //link linkUrl defined
    //img mediaType: image
    //vid mediaType: video

    var faviconUrl = tab.faviconUrl
      , url = tab.url
      , title = tab.title;
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        var id = tabs[0].id;
        chrome.tabs.sendMessage(id, {greeting: 'hello'}, function(response) {
            console.log(response);
            console.log(faviconUrl, url, title);
        });
    });
}

chrome.contextMenus.create({
    id: 'tte', 
    title: 'Track This Element',
    contexts: ['page', 'selection', 'link', 'image', 'video'],
    onclick: clickHandler
    }, function() {
        if(chrome.extension.lastError) {
            console.log("Got error", chrome.extension.lastError);
        }
    }
);

