//Remove method
if (!Element.prototype.remove) {
    Element.prototype.remove = function() {
        if (this.parentNode) {
            this.parentNode.removeChild(this);
        }
    };
}

//Classlist prototype
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