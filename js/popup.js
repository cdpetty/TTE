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
        console.log("DATE:", dating);
        obj[url] = {"hash":hash, "title":title, "location":loc, "id":id, "date":dating};
        chrome.storage.sync.set(obj, function(){
            if (callback) callback(obj);
        });
    });
}

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

var check_tracked_elements = function(){
    dumpdb(function(db_entries){
        //iterate over all the tracked entries in the db
        Object.keys(db_entries).forEach(function(key){
            if (key !== "uniqueid"){
                var tracked_element = db_entries[key];
                $.get(tracked_element.url, function(data){
                    /*GET HTML THAT NEEDS TO BE HASHED AND STORE IT IN:
                    var newHTML*/
                    var newHash = MD5(newHTML)
                    
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

var populate = function(){
    for(var element = 0; element < (showThisManyElements | elements.length % 5); element++){
        var toBeAdded = elements[element];
        var tracked_element = $('<div>')
            .attr("id", toBeAdded.uniqueid)
            .addClass("tracked_element");
        var tracked_element_fav = $('<img>')
            .addClass("favicon")
            .attr("src", "icon16.png")//toBeAdded.favIcon)
            .appendTo(tracked_element);
        var tracked_element_title = $('<span>')
            .addClass("title");
        var tracked_element_a = $('<a>')
            .text(toBeAdded.title)
            .attr("src", toBeAdded.url)
            .appendTo(tracked_element_title);
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
    }
}


$(document).ready(function(){
    if (elements.length !== 0){
        populate();
    }
    else{
        dumpdb(function(db_entries){
            //iterate over all the tracked entries in the db
            var counter = 0;
            Object.keys(db_entries).forEach(function(key){
                if (key !== "uniqueid" && counter < 5){
                    elements.push(db_entries[key]);
                    counter++;
                }
            });
            populate();
        });
    }
});