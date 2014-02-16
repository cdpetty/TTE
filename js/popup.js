//update a db entry
var update = function(url, hash, callback){
    get(url, function(found){
        console.log(found);
        var obj = {};
        obj[url] = {"hash":hash, "title":found[url].title, "location":found[url].location, "id":found[url].id, "date":Date.now()}
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
    formatedDate += unformatedDate.getMinutes() < 10 ? '0' + unformatedDate.getMinutes() : unformatedDate.getMinutes();
    if (unformatedDate.getHours() >=11) formatedDate += ' PM';
    else formatedDate += ' AM';
    return formatedDate;
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

var updated = false;

var check_tracked_elements = function(){
    dumpdb(function(db_entries){
        //iterate over all the tracked entries in the db
        Object.keys(db_entries).forEach(function(key){
            if (key !== "uniqueid"){
                var tracked_element = db_entries[key];
                $.get(key, function(data){
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
                        obj[key] = {"hash":newHash, "title":tracked_element.title, "location":tracked_element.location, "id":tracked_element.id, "date":dating};
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
        /*CHANGE OVERALL TIME*/
    });
    if (updated){
        chrome.browserAction.setIcon({path: 'icon_updated.png'})
    }
}

setInterval(check_tracked_elements, .15*1000*60);

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
                    .attr("id", obj.url)
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
                    tracked_element.siblings().each(function(sibling){
                        $(this).slideToggle("slow");
                    });
                    $('.fulltext').slideToggle("fast");
                    if (tracked_element_dropdown.attr("src") === "down.png"){
                        tracked_element_dropdown.attr("src", "up.png");
                        $.get(key, function(data){
                            var newHTML = data;
                            //console.log(obj);
                            var elem = $(obj.location.toLowerCase(), parseHTML(data));
                            var summary = elem.get(0).innerText;
                            $('.fulltext').prepend(summary);
                        });
                    }
                    else{
                      tracked_element_dropdown.attr("src", "down.png");
                        $('.fulltext').html("<hr/>");
                    }
                });

                var elementName = "#e" + toBeAdded.uniqueid;
                tracked_element_title.click(function(){
                    //console.log("ELEMENTNAME:", elementName);
                    chrome.tabs.create({ url: toBeAdded.url });
                });
            }
        });
    });
    $('.update').text("Last Updated: " + getDate());
});

document.addEventListener("DOMContentLoaded", function(){
    updated = false;
});
