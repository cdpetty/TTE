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
                    .text(toBeAdded.title);
                if(toBeAdded.updated){
                    tracked_element_title.css("color", "#1E0FBE");
                    obj.updated = false;
                }
                tracked_element_title.appendTo(tracked_element);
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
                tracked_element_title.click(function(){
                    tracked_element_title.css("color","#1E0FBE");
                });
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
                obj.updated = false;
                obj[key] = obj;
                console.log(obj);
                if(toBeAdded.updated){
                    obj.updated = false;
                    console.log(":)", obj);
                    chrome.storage.sync.set(obj, function(saved){
                    });
                }
            }
        });
    });
    $('.update').text("Last Updated: " + getDate());
});

document.addEventListener("DOMContentLoaded", function(){
    chrome.runtime.sendMessage({"notify":true}, function(response){
        if(response.seen) {
               
        }
    });
});
