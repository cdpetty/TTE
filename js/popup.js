//update a db entry
var update = function(url, hash, callback){
    chrome.storage.sync.get(url, function(found){
        var obj = {};
        obj[url] = {"hash":hash, "title":found.title, "location":found.location, "id":found.id, "date":Date.now()}
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
var check_tracked_elements = function(){
    dumpdb(function(db_entries){
        //iterate over all the tracked entries in the db
        Object.keys(db_entries).forEach(function(key){
            if (key !== "uniqueid"){
                var tracked_element = db_entries[key];
                $.get(key, function(data){
                    /*GET HTML THAT NEEDS TO BE HASHED AND STORE IT IN:*/
                    var newHTML = data;
                    console.log('thisis', tracked_element.location);
                    console.log($(tracked_element.location.toLowerCase(), parseHTML(data)));
                    /*
                    var path = tracked_element.location.split('/');
                    console.log(path);
                    path.forEach(function(el, i) {
                        var times = 1;
                        if(el.indexOf('.') > 0) {
                            var sp = el.split('.');
                            times += parseInt(sp[1], 10);
                            el = sp[0];
                        }
                        for(var i=0;i<times;i++) {
                            newHTML = data.substring(data.indexOf('<' + el.toLowerCase()));
                        }
                    });
                    var lastTag = path[path.length - 1].toLowerCase();
                    if(lastTag.indexOf('.') > 0) {
                        lastTag = lastTag.substring(0, lastTag.indexOf('.'));
                    }
                    lastTag = '</' + lastTag + '>';
                    var tagIndex = newHTML.indexOf(lastTag);
                    newHTML = newHTML.substring(0, tagIndex+lastTag.length);
                    console.log(newHTML);
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
                    //console.log(newHTML);
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

                console.log(tracked_element_dropdown.src)
                tracked_element_dropdown.click(function(){
                    tracked_element.siblings().each(function(sibling){
                        $(this).slideToggle("slow");
                    });
                    $('.fulltext').slideToggle("fast");
                    if (tracked_element_dropdown.attr("src") === "down.png"){
                      tracked_element_dropdown.attr("src", "up.png");
                    }
                    else{
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
