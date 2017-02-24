'use strict';
if (typeof window === 'undefined') module.exports = HangMan;

Array.prototype.clone = function() {
    return this.slice(0);
}
if (typeof Object.assign != 'function') {
    Object.assign = function (target, varArgs) { // .length of function is 2
        'use strict';
        if (target == null) { // TypeError if undefined or null
            throw new TypeError('Cannot convert undefined or null to object');
        }

        var to = Object(target);

        for (var index = 1; index < arguments.length; index++) {
            var nextSource = arguments[index];

            if (nextSource != null) { // pasamos si es undefined o null
                for (var nextKey in nextSource) {
                    // Evita un error cuando 'hasOwnProperty' ha sido sobrescrito
                    if (Object.prototype.hasOwnProperty.call(nextSource, nextKey)) {
                        to[nextKey] = nextSource[nextKey];
                    }
                }
            }
        }
        return to;
    };
}

function HangMan(deliveranceWord) {

    if (!deliveranceWord.match(/^([a-zA-Z]+)$/)) {
        console.log("Invalid word");
        return;
    }

    deliveranceWord = deliveranceWord.toLowerCase();

    // "almost-anti"-pattern: private variables (accessible through closure)
    var bodyParts  = ["head", "neck", "chest", "arm1", "arm2", "leg1", "leg2"],
        saved      = false,
        dead       = false,
        guessed    = new Array(deliveranceWord.length),
        drawnParts = [],
        callbacks  = {
            fail : function (part, partsLeft) { console.log("Drawed " + part) },
            guess: function(currentGuess) { console.log(currentGuess) },
            saved: function(word) { console.log("Saved by: " + word) },
            dead : function(word) { console.log("Game over! Word was " + word); return word }
        };

    console.log("The game is On! " + deliveranceWord.length + " letters 'til hang...");

    // "public" properties
    this.failed  = [];
    this.guessed = new Array(deliveranceWord.length);

    // public methods
    this.try = tryLetter;
    this.on  = registerEvent;

    // fn definitions
    function tryLetter(letter) {
        if (dead)  return "Dead man! You're hanging!";
        if (saved) return "You're already saved! Wanna come back to the gallow?";

        var invalid = invalidInput.call(this, letter);
        if (invalid !== false) {
            return invalid;
        }

        letter = letter.toLowerCase();
        var pos, iPos = 0;
        while ( (pos = deliveranceWord.indexOf(letter, iPos)) !== -1 ) {
            guessed[pos] = deliveranceWord[pos];
            iPos = pos + 1;
        }

        if (iPos === 0) {
            this.failed.push(letter);
            var part = bodyParts.shift();
            drawnParts.push(part);
            trigger("fail", part, bodyParts.clone());

            if (!bodyParts.length) {
                dead = true;
                trigger("dead", deliveranceWord);
            }
            return; // return what? :)
        }

        if ( guessed.join("") === deliveranceWord ) {
            saved = true;
            trigger("saved", deliveranceWord);
            return;
        }
        // @TODO already guessed ?
        this.guessed = guessed.clone(); // for safety
        trigger("guess", this.guessed);
        return this.guessed;
    }

    function invalidInput(letter) {
        if (!letter.match(/^[a-zA-Z]$/)) {
            return "Invalid input";
        }
        if (this.failed.indexOf(letter) !== -1) {
            return "Already failed with that letter...";
        }
        return false;
    }

    function registerEvent() {
        if (typeof arguments[0] === 'object') {
            callbacks = Object.assign(callbacks, arguments[0]);
            return;
        }
        if (typeof arguments[1] === 'function') {
            var ev = arguments[0],
                cb = arguments[1];
            callbacks[ev] = cb;
        }
    }

    function trigger() {
        var
            args = [].slice.call(arguments, 0),
            evt  = args.shift();
        return (callbacks[evt] || noop).apply(this, args);
    }

    function noop(){}
}
