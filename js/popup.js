document.addEventListener('DOMContentLoaded', function () {
    console.log('hello world!');
});

$('#check').click(function(){
    storeNew("teguh.com", "1234", "TEGUH", "4");
    get("teguh.com");
    nextUniqueId(function(id){
        console.log(id);
    });
});

function storeNew(url, hash, title, loc, callback){
    nextUniqueId(function(id){
        var obj = {};
        obj[url] = {"hash":hash, "title":title, "location":loc, "id":id};
        chrome.storage.sync.set(obj, function(){
            if (callback) callback();
        });
    });
}
function update(url, hash, callback){
    chrome.storage.sync.get(url, function(found){
        var obj = {};
        obj[url] = {"hash":hash, "title":found.title, "location":found.loc, "id":found.id}
        chrome.storage.sync.set(obj, function(){
            if (callback) callback();
        });
    });
}

function get(url, callback){
    chrome.storage.sync.get(url, function(found){
        if (callback) callback(found);
    });
}

function nextUniqueId(callback){
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

function cleardb(){
    chrome.storage.sync.clear();
}

function dumpdb(){
    chrome.storage.sync.get(null, function(found){
        console.log(found);
    });
}

chrome.storage.onChanged.addListener(function(changes, namespace) {
  for (key in changes) {
    var storageChange = changes[key];
    console.log('Storage key "%s" in namespace "%s" changed. ' +
                'Old value was "%s", new value is "%s".',
                key,
                namespace,
                storageChange.oldValue,
                storageChange.newValue);
  }
});