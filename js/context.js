var clickHandler = function(info, tab) {
    console.log(info);
    var faviconUrl = tab.faviconUrl;
    var url = tab.url;
    var title = tab.title;
}

chrome.contextMenus.create({
    id: 'tte', 
    title: 'Track This Element',
    contexts: ['page', 'selection', 'link', 'image', 'video'],
    onclick: clickHandler
}, function() {
    if(chrome.extension.lastError) {
        console.log("Got error", chrome.extension.lastError);
    }
});

