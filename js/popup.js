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

var getDate =  function(){
    var unformatedDate = new Date();
    var formatedDate = '';
    formatedDate += (unformatedDate.getMonth() + 1) + '/';
    formatedDate += unformatedDate.getDate() + '/';
    formatedDate += unformatedDate.getFullYear() + ' at ';
    formatedDate += unformatedDate.getHours() % 12 == 0 ? 12 : (unformatedDate.getHours()%12)+ ':';
    var minutes = unformatedDate.getMinutes().length == 1 ? "0" + unformatedDate.getMinutes() : unformatedDate.getMinutes();
    formatedDate += minutes;
    if (unformatedDate.getHours() >= 11) formatedDate += ' PM';
    else formatedDate += ' AM';
    return formatedDate;
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

function toNode(html) {
    var doc = document.createElement('html');
    doc.innerHTML = html;
    return doc;
}

var check_tracked_elements = function(){
    dumpdb(function(db_entries){
        //iterate over all the tracked entries in the db
        Object.keys(db_entries).forEach(function(key){
            if (key !== "uniqueid"){
                var tracked_element = db_entries[key];
                $.get(key, function(data){
                    /*GET HTML THAT NEEDS TO BE HASHED AND STORE IT IN:*/
                    var newHTML = toNode(data);
                    /*
                    var newHash = MD5(newHTML);
                    
                    //website has changed and db needs to be updated
                    if (newHash !== tracked_element.hash){
                        //update any elements that have been altered
                        update(tracked_element.url, newHash, function(saved){
                            /*CHANGE INDIVIDUAL TIME
                            var daysSinceLastChange = 0;
                        });
                    }
                    else{
                        var currentDate = new Date();
                        var daysSinceLastChange = (currentDate - tracked_element.date) / 1000 / 60 / 60 / 24;
                    }*/
                    console.log(newHTML);
                });
            }
        });
        
        $('.update').text("Last Updated: " + getDate());
        /*CHANGE OVERALL TIME*/
    });
}

//setInterval(check_tracked_elements, 5*1000*60);

var favicon_str = "http://getfavicon.appspot.com/";

$(document).ready(function(){
    dumpdb(function(db_entries){
        //iterate over all the tracked entries in the db
        Object.keys(db_entries).forEach(function(key){
            if (key !== "uniqueid"){
                var obj = $.extend({}, db_entries[key]);
                obj["url"] = key;
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
                
                //Watch for these events
                tracked_element_dropdown.click(function(){
                    if (tracked_element_dropdown.attr("src") === "down.png"){
                        tracked_element.siblings().each(function(sibling){
                            $(this).fadeOut("slow");
                        });
                        //PUT WHAT FULL TEXT SHOULD HAVE
                        $('.fulltext').fadeIn(function(){
                            tracked_element_dropdown.attr("src", "up.png");
                        });
                    }
                    else{
                        //PUT WHAT FULL TEXT SHOULD HAVE
                        $('.fulltext').fadeOut(function(){
                            tracked_element.siblings().each(function(sibling){
                                $(this).fadeIn("slow");
                            });
                        });
                        tracked_element_dropdown.attr("src", "down.png");
                    }
                });
                
                var elementName = "#e" + toBeAdded.uniqueid;
                tracked_element_title.click(function(){
                    console.log("ELEMENTNAME:", elementName);
                    chrome.tabs.create({ url: toBeAdded.url });
                });
            }
        });
    });
    $('.update').text("Last Updated: " + getDate());
});

function parse(node){
    var path = [];
    var el = node;
    do {
    path.unshift(el.nodeName + (el.className ? ' class="' + el.className + '"' : ''));
    } while ((el.nodeName.toLowerCase() != 'html') && (el = el.parentNode));
    return (path.join(" > "));
}