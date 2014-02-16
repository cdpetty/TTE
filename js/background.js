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

function parseHTML(markup) {
    var doc = document.implementation.createHTMLDocument("");

    if (markup.toLowerCase().indexOf('<!doctype') > -1) {
        doc.documentElement.innerHTML = markup;
    } else {
        doc.body.innerHTML = markup;
    }
    return doc;
}

var getDate =  function(){
    var unformatedDate = new Date();
    var formatedDate = '';
    formatedDate += (unformatedDate.getMonth() + 1) + '/';
    formatedDate += unformatedDate.getDate() + '/';
    formatedDate += unformatedDate.getFullYear() + ' at ';
    formatedDate += unformatedDate.getHours() % 12 == 0 ? 12 : (unformatedDate.getHours()%12)+ ':';
    formatedDate += unformatedDate.getMinutes() < 10 ? '0' + unformatedDate.getMinutes() : unformatedDate.getMinutes();
    if (unformatedDate.getHours() >=11) formatedDate += ' PM';
    else formatedDate += ' AM';
    return formatedDate;
}

//Get an object of all the entries in the database
var dumpdb = function(callback){
    chrome.storage.sync.get(null, function(found){
        callback(found);
    });
}

var updated = false;

var check_tracked_elements = function(){
    dumpdb(function(db_entries){
        //iterate over all the tracked entries in the db
        Object.keys(db_entries).forEach(function(key){
            if (key !== "uniqueid") {
                var tracked_element = db_entries[key];
                $.get(key, function(data) {
                    /*GET HTML THAT NEEDS TO BE HASHED AND STORE IT IN:*/
                    var newHTML = data;
                    //console.log('thisis', tracked_element.location);
                    var elem = $(tracked_element.location.toLowerCase(), parseHTML(data));
                    //console.log(elem.get(0).outerHTML);
                    var newHash = MD5(newHTML);
                    //website has changed and db needs to be updated
                    console.log(newHash, tracked_element.hash);
                    if (newHash !== tracked_element.hash){
                        //update any elements that have been altered
                        var obj = {};
                        var dating = Date.now();
                        obj[key] = {"hash":newHash, "title":tracked_element.title, "location":tracked_element.location, "id":tracked_element.id, "date":dating, "updated":true};
                        chrome.storage.sync.set(obj, function(){
                            console.log("SAVED");
                            updated = true;
                            chrome.notifications.create("", {
                                type: 'basic',
                                title: title + 'updated',
                                message: 'Check out the changes!'
                            }, function() {

                            });
                        });
                    }
                });
            }
        });
        
        $('.update').text("Last Updated: " + getDate());
    });
    if (updated){
        chrome.browserAction.setIcon({path: 'icon_updated.png'})
    }
//    else{
//        chrome.browserAction.setIcon({path: 'icon.png'})
//    }
}

setInterval(check_tracked_elements, .15*1000*60);

chrome.runtime.onMessage.addListener(function(req, sender, sendResponse) {
    updated = false;
    chrome.browserAction.setIcon({path: 'icon.png'})
    
});

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
