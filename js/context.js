chrome.contextMenus.create({id: 'tte', title: 'Track %s'}, function() {
    if(chrome.extension.lastError) {
        console.log("Got error", chrome.extension.lastError);
    }
});

