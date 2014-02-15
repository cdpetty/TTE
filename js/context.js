var clickHandler = function(info, tab) {
    console.log(info);
    console.log(tab);
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

