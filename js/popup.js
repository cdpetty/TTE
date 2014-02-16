//update a db entry
var update = function(url, hash, callback){
    chrome.storage.sync.get(url, function(found){
        var obj = {};
        obj[url] = {"hash":hash, "title":found.title, "location":found.loc, "id":found.id, "date":Date.now()}
        chrome.storage.sync.set(obj, function(){
            if (callback) callback(obj);
        });
    });
}

//get a db entry
var get = function(url, callback){
    chrome.storage.sync.get(url, function(found){
        if (callback) callback(found);
    });
}

//clear out the database... BE CAREFUL
var cleardb = function(){
    chrome.storage.sync.clear();
}

//Get an object of all the entries in the database
var dumpdb = function(callback){
    chrome.storage.sync.get(null, function(found){
        callback(found);
    });
}

function getElementByHash(hashValue) {
    var el = null;
    var frags = hashValue.split(":");
    if (frags.length !== 3)
        return null;

    else {
        var tag = frags[0];
        var hashKey = frags[1];
        var hash = parseInt(frags[2]);

        $('body *').each(function() {
            if (hashKey == "H") {
                if ((getHash($(this).html()) - hash) == 0) {
                    el = $(this);
                    return false;
                }
            }
            else {
                if ((getHash(getElementAttributes($(this))) - hash) == 0) {
                    el = $(this);
                    return false;
                }                    
            }
        });
    }
    return el;
}

var check_tracked_elements = function(){
    dumpdb(function(db_entries){
        //iterate over all the tracked entries in the db
        Object.keys(db_entries).forEach(function(key){
            if (key !== "uniqueid"){
                var tracked_element = db_entries[key];
                $.get(key, function(data){
                    /*GET HTML THAT NEEDS TO BE HASHED AND STORE IT IN:*/
                    var newHTML = data;

                    var newHash = MD5(newHTML);
                    
                    //website has changed and db needs to be updated
                    if (newHash !== tracked_element.hash){
                        //update any elements that have been altered
                        update(tracked_element.url, newHash, function(saved){
                            /*CHANGE INDIVIDUAL TIME*/
                            var daysSinceLastChange = 0;
                        });
                    }
                    else{
                        var currentDate = new Date();
                        var daysSinceLastChange = (currentDate - tracked_element.date) / 1000 / 60 / 60 / 24;
                    }
                });
            }
        });
        /*CHANGE OVERALL TIME*/
    });
}

setTimeout(check_tracked_elements, 5*60*1000);

function getDate(){
    var unformatedDate = new Date();
    var formatedDate = '';
    formatedDate += (unformatedDate.getMonth() + 1) + '/';
    formatedDate += unformatedDate.getDate() + '/';
    formatedDate += unformatedDate.getFullYear() + ' at ';
    formatedDate += unformatedDate.getHours() % 12 == 0 ? 12 : (unformatedDate.getHours()%12)+ ':';
    formatedDate += unformatedDate.getMinutes();
    if (unformatedDate.getHours() >=11) formatedDate += ' PM';
    else formatedDate += ' AM';
    return formatedDate;
}

var elements = [];
var showThisManyElements = null;
var favicon_str = "http://getfavicon.appspot.com/";

$(document).ready(function(){
    dumpdb(function(db_entries){
        //iterate over all the tracked entries in the db
        Object.keys(db_entries).forEach(function(key){
            if (key !== "uniqueid"){
                var obj = $.extend({}, db_entries[key]);
                obj["url"] = key;
                console.log("This is the key:", obj.url, "for object:", obj);
                var toBeAdded = obj;
                var tracked_element = $('<div>')
                    .attr("id", obj.url)//"e" + toBeAdded.uniqueid)
                    .addClass("tracked_element");
                var tracked_element_fav = $('<img>')
                    .addClass("favicon")
                    .attr("src", favicon_str + key)
                    .appendTo(tracked_element);
                var tracked_element_title = $('<span>')
                    .addClass("title")
                    .text(toBeAdded.title)
                    .appendTo(tracked_element);
                var tracked_element_dropdown = $('<img>')
                    .addClass("dropdown")
                    .attr("src", "down.png")
                    .appendTo(tracked_element);
                var currentDate = new Date();
                var daysSinceLastUpdate = Math.floor((currentDate - toBeAdded.date) / 1000 / 60 / 60 / 24);
                var daysSinceString = "";
                switch (daysSinceLastUpdate){
                    case 0: daysSinceString = "Today"; break;
                    case 1: daysSinceString = "1 day ago"; break;
                    default: daysSinceString = daysSinceLastUpdate + " days ago";
                }
                var tracked_element_modified = $('<span>')
                    .text("Modified: " + daysSinceString)
                    .addClass("element_update")
                    .appendTo(tracked_element);
                var tracked_element_hr = $('<hr/>')
                    .appendTo(tracked_element);
                tracked_element.appendTo(".tracked_elements");
                var elementName = "#e" + toBeAdded.uniqueid;
                tracked_element.click(function(){
                    console.log("ELEMENTNAME:", elementName);
                    chrome.tabs.create({ url: toBeAdded.url });
                });
            }
        });
    });
});
