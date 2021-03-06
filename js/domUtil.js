var UTIL = (function(u) {
    //Set up sub module
    var sub = u.dom = u.dom || {};

    //Dependencies
    var strU = u.string;
    /*
    DOM Functionality
    */
    var doc = document,
        $ = function(domElement) {
            if (!singleSelector(domElement)) {
                try {
                    return doc.querySelectorAll(domElement);
                } catch(e) {
                    console.log(e);
                }
            } else {
                if (domElement.indexOf('#') === 0) {
                    try {
                        return [(doc.getElementById(domElement.substring(1,domElement.length)))];
                    } catch(e) {
                        console.log(e);
                    }
                } else if (domElement.indexOf('.') === 0){
                    try {
                        return doc.getElementsByClassName(domElement.substring(1,domElement.length));
                    } catch(e) {
                        console.log(e);
                    }
                } else {
                    try {
                        return doc.getElementsByTagName(domElement);
                    } catch(e) {
                        console.log(e);
                    }
                }
            }
        },

        singleSelector = function(str) {
            var arr;
            
            arr = str.split(" ");
            if (arr.length === 1 && strU.numChar(str, "#") <= 1 && strU.numChar(str, ".") <= 1) {
                return true;
            } else {   
                return false;
            } 
        },
        assignEvent = function(de, event, funct) {
            //use for loop since node list is not an array
            try {
                for (let i = 0; i < de.length; i++) {
                    de[i].addEventListener(event, funct);
                }
            } catch(e) {
                console.log(e);
            }
            
        },
        setHTML = function(de, html) {
            try {
                for (let i = 0; i < de.length; i++) {
                    de[i].innerHTML = html;
                }
            } catch(e) {
                console.log(e);
            }
        },
        data = function(de, term) {
            var arr = [];
            if (de.length > 1) {
                for (let i = 0; i < de.length; i++) {
                    arr[i] = de[i].getAttribute('data-' + term);
                }
            } else {
                return de[0].getAttribute('data-' + term);
            }
        },
        addClass = function(de, cls) {
            for (let i = 0; i < de.length; i++) {
                if (de[i].classList) {
                    de[i].classList.add(cls);
                } else {
                    de[i].className += ' ' + cls;
                }
            }
        },
        removeClass = function(de, cls) {
            for (let i = 0; i < de.length; i++) {
                if (de[i].classList) {
                    de[i].classList.remove(cls);
                } else {
                    de[i].className.replace(/\bcls\b/,'');
                }
            }
        },
        modalProto = {
            setNode: function(node) {
                this.modal = document.querySelector(node)
                return this;
            },
            open: function() {
                this.modal.style.display = "block";
                return this;
            },
            close: function() {
                this.modal.style.display = "none";
                return this;
            },
            setText: function(text) {
                this.modal.querySelector("#modal-text").innerText = text;
                return this;
            },
            setSubText: function(text) {
                const modalbody = $("#modal-content");
                const subText = document.createElement("div");
                subText.className = "modal-subtext"
                this.modal.querySelector(".modal-subtext").innerText = text;
                return this;
            }
            // setColor: function(color) {
            //     this.modal.querySelector("#modal-content").style.backgroundColor = color;
            //     return this;
            // },
            // setTime: function(result) {
            //     if(result) {
            //         this.modal.querySelector("#modal-time").innerText = "Twój czas to: " + timer.innerText;
            //     } else {
            //         this.modal.querySelector("#modal-time").innerText = "";
            //     }
            //     return this;
            // }
        }

        //Public Methods and Properties
        sub.$ = $;
        sub.assignEvent = assignEvent;
        sub.data = data;
        sub.addClass = addClass;
        sub.removeClass = removeClass;
        sub.setHTML = setHTML;
        sub.modalProto = modalProto;

        return u;
})(UTIL || {});