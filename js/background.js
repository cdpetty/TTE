var clickHandler = function(info, tab) {
    //link linkUrl defined
    //img mediaType: image
    //vid mediaType: video

    var faviconUrl = tab.faviconUrl
      , url = tab.url
      , title = tab.title;
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
    }
);

