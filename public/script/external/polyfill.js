(function(){
    var arr=[window.Element,window.CharacterData,window.DocumentType];
    arr.forEach(function(item){
        if(item&&item.prototype&&!item.prototype.hasOwnProperty('remove')){
            Object.defineProperty(item.prototype,'remove',{configurable:true,enumerable:true,writable:true,value:function(){if(this.parentNode!==null)this.parentNode.removeChild(this);}});
        }
    });
})();

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

if(typeof NodeList!=='undefined'&&!NodeList.prototype.forEach)
    NodeList.prototype.forEach=Array.prototype.forEach;

// Polyfill Array.from
if(!Array.from) Array.from=(function(){return function from(a){return Array.prototype.slice.call(a);};})();

// Symbol minimal polyfill per evitare crash
if(typeof Symbol === 'undefined'){
    window.Symbol = function(desc){ return '__symbol__' + desc + '__' + Math.random(); };
    window.Symbol.iterator = '__symbol__iterator__';
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

(function(){
    if(typeof window.Event === 'function') return;
    function Event(e,t){t=t||{};var v=document.createEvent('Event');v.initEvent(e,!!t.bubbles,!!t.cancelable);return v;}
    Event.prototype=window.Event.prototype;
    window.Event=window.CustomEvent=Event;
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