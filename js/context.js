function find(el){
    var path = [];
    do {
        path.unshift(el.nodeName + (el.className ? ' class="' + el.className + '"' : ''));
    } while ((el.nodeName.toLowerCase() != 'html') && (el = el.parentNode));

    console.log(path.join(" > "));
}

var target = null;
document.addEventListener('mousedown', function(event) {
    target = event.target;
    console.log(find(target));
}, true);

