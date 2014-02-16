var target = null;
function getElementPath(element)
{
    return $(element).parents().andSelf().map(function() {
        var $this = $(this);
        var tagName = this.nodeName;
        if ($this.siblings(tagName).length > 0) {
            tagName += ":nth-child(" + ($this.prevAll(tagName).length+1) + ")";
        }
        return tagName;
    }).get().join(" > ").toUpperCase();
}

document.addEventListener('mousedown', function(event) {
    target = event.target;
}, true);

chrome.runtime.onMessage.addListener(function(req, sender, sendResponse) {
    console.log(req, sender);
    console.log(target.outerHTML);
    sendResponse({'html': target.outerHTML, 'hash': getElementPath(target)});
});
