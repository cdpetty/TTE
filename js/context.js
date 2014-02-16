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

var target = null;

document.addEventListener('mousedown', function(event) {
    target = event.target;
}, true);

chrome.runtime.onMessage.addListener(function(req, sender, sendResponse) {
    console.log(req, sender);
    console.log(target.outerHTML);
    sendResponse({'html': target.outerHTML, 'hash': getElementHash($(target), target.nodeName)});
});
