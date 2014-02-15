chrome.contextMenus.create({id: 'tte', title: 'Track %s'});

document.addEventListener('DOMContentLoaded', function () {
    console.log('hello world!');
});

$('#check').click(function(){
    storeNew("TEGUH", "1234", "teguh.com", "4");
    get("TEGUH");
});

function storeNew(title, hash, url, location){
    var obj = {};
    obj[title] = {"hash":hash, "url":url, "location":location};
    console.log(obj);
    chrome.storage.sync.set(obj, function(){
        console.log("Set");
    });
}
function update(title, hash){
    chrome.storage.sync.get("title", function(found){
        if (found){
            console.log(found);
        }
    });
}

function get(title){
    chrome.storage.sync.get(title, function(found){
        console.log(found);
    });
}
