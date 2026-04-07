// 1. Metodo .remove()
if (!Element.prototype.remove) {
    Element.prototype.remove = function() {
        if (this.parentNode) this.parentNode.removeChild(this);
    };
}

// 2. AudioContext
window.AudioContext = window.AudioContext || window.webkitAudioContext;

// 3. Custom Events (new Event / new CustomEvent)
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

// 4. ClassList (il tuo codice che avevi già)
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