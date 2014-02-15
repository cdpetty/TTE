chrome.contextMenus.create({id: 'tte', title: 'Track %s'});

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

function storeNew(url, hash, title, location, callback){
    var obj = {};
    obj[url] = {"hash":hash, "title":title, "location":location};
    chrome.storage.sync.set(obj, function(){
        callback();
    });
}
function update(url, hash, callback){
    chrome.storage.sync.get(url, function(found){
        found.hash = hash;
        chrome.storage.sync.set(found);
    });
}

function get(url, callback){
    chrome.storage.sync.get(url, function(found){
        callback(found);
    });
}

function nextUniqueId(callback){
    chrome.storage.sync.get("uniqueid", function(found){
        if (!found.uniqueid) {
            chrome.storage.sync.set({"uniqueid": 1});
            callback(0);
        }
        else{
            chrome.storage.sync.set({"uniqueid": found.uniqueid + 1});
            callback(found.uniqueid);
        }
    });
}