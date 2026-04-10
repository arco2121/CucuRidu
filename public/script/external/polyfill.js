// Element.remove() polyfill
if (!Element.prototype.remove) {
    Element.prototype.remove = function() {
        if (this.parentNode) this.parentNode.removeChild(this);
    };
}

// Event constructor polyfill
(function() {
    if (typeof window.CustomEvent === "function") return;
    function CustomEvent(event, params) {
        params = params || { bubbles: false, cancelable: false, detail: null };
        var evt = document.createEvent('CustomEvent');
        evt.initCustomEvent(event, params.bubbles, params.cancelable, params.detail);
        return evt;
    }
    CustomEvent.prototype = window.Event.prototype;
    window.CustomEvent = CustomEvent;
    window.Event = CustomEvent;
})();

// NodeList.forEach polyfill
if (typeof NodeList !== "undefined" && NodeList.prototype && !NodeList.prototype.forEach) {
    NodeList.prototype.forEach = Array.prototype.forEach;
}

//AudioContext
window.AudioContext = window.AudioContext || window.webkitAudioContext;

//Custom Events
(function () {
    if (typeof window.CustomEvent === "function") return false;
    function CustomEvent(event, params) {
        params = params || { bubbles: false, cancelable: false, detail: undefined };
        var evt = document.createEvent('CustomEvent');
        evt.initCustomEvent(event, params.bubbles, params.cancelable, params.detail);
        return evt;
    }
    CustomEvent.prototype = window.Event.prototype;
    window.CustomEvent = CustomEvent;
    window.Event = CustomEvent;
})();

//ClassList
var testElement = document.createElement("_");
testElement.classList.add("a", "b");
if (!testElement.classList.contains("b")) {
    var originalAdd = DOMTokenList.prototype.add;
    DOMTokenList.prototype.add = function() {
        for (var i = 0; i < arguments.length; i++) {
            originalAdd.call(this, arguments[i]);
        }
    };
}