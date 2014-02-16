//generate the next unique id (used to tell tracked instances that have the same url apart)
var nextUniqueId = function(callback){
    chrome.storage.sync.get("uniqueid", function(found){
        if (!found.uniqueid) {
            chrome.storage.sync.set({"uniqueid": 1});
            if (callback) callback(0);
        }
        else{
            chrome.storage.sync.set({"uniqueid": found.uniqueid + 1});
            if (callback) callback(found.uniqueid);
        }
    });
}

//Store a new instance of a tracked element in the db
var storeNew = function(url, hash, title, loc, callback){
    nextUniqueId(function(id){
        var obj = {};
        var dating = Date.now();
        obj[url] = {"hash":hash, "title":title, "location":loc, "id":id, "date":dating};
        chrome.storage.sync.set(obj, function(){
            if (callback) callback(obj);
        });
    });
}


var clickHandler = function(info, tab) {
    var faviconUrl = tab.faviconUrl
        , url = tab.url
        , title = tab.title;

    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        var id = tabs[0].id;
        chrome.tabs.sendMessage(id, {}, function(response) {
            console.log(response);
            console.log(faviconUrl, url, title);
            storeNew(url, MD5(response.html), title, response.hash);
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
});
