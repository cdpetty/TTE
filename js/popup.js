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
        obj[url] = {"hash":hash, "title":title, "location":loc, "id":id, "date":new Date()};
        chrome.storage.sync.set(obj, function(){
            if (callback) callback(obj);
        });
    });
}

//update a db entry
var update = function(url, hash, callback){
    chrome.storage.sync.get(url, function(found){
        var obj = {};
        obj[url] = {"hash":hash, "title":found.title, "location":found.loc, "id":found.id, "date":new Date()}
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