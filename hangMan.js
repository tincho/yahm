'use strict';
if (typeof window === 'undefined') {
    require("./Object.assign.js");
    module.exports = HangMan;
}

Array.prototype.clone = function() {
    return this.slice(0);
}

function HangMan(deliveranceWord, events) {

    if (!deliveranceWord.match(/^([a-zA-Z]+)$/)) {
        throw new Error("Invalid word");
        console.log("Invalid word");
        return;
    }

    deliveranceWord = deliveranceWord.toLowerCase();

    // "almost-anti"-pattern: private variables (accessible through closure)
    var bodyParts  = ["head", "neck", "chest", "arm1", "arm2", "leg1", "leg2"],
        saved      = false,
        dead       = false,
        drawnParts = [],
        guessed    = new Array(deliveranceWord.length),
        callbacks  = Object.assign({
            fail : function(part, partsLeft) { console.log("Drawed " + part) },
            guess: function(currentGuess) { console.log(currentGuess) },
            saved: function(word) { console.log("Saved by: " + word) },
            dead : function(word) { console.log("Game over! Word was " + word); return word }
        }, events),
        trigger    = triggerEvent.bind({ callbacks: callbacks });

    console.log("The game is On! " + deliveranceWord.length + " letters 'til hang...");

    // "public" properties
    this.failed  = [];
    this.guessed = guessed.clone();

    // public methods
    this.on     = registerEvent.bind({callbacks: callbacks})
    this.try    = tryLetter;
    this.hazard = hazardWord;

    // fn definitions
    function tryLetter(letter) {
        if (dead)  return "Dead man! You're hanging!";
        if (saved) return "You're already saved! Wanna come back to the gallow?";

        var invalid = invalidInput.call(this, letter);
        if (invalid !== false) {
            return invalid;
        }

        letter = letter.toLowerCase();

        if (guessed.indexOf(letter) !== -1) return;

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
                hang();
            }
            return; // return what? :)
        }

        this.guessed = guessed.clone(); // for safety
        trigger("guess", this.guessed);

        if ( guessed.join("") === deliveranceWord ) {
            save();
        }
        return this.guessed; // is this needed?
    }

    function hazardWord(word) {
        var success = (word === deliveranceWord);
        return [hang, save][+success]();
    }

    function hang() {
        dead = true;
        trigger("dead", deliveranceWord);
    }

    function save() {
        saved = true;
        trigger("saved", deliveranceWord);
    }

    // utilities
    function invalidInput(letter) {
        if (!letter.match(/^[a-zA-Z]$/)) {
            return "Invalid input";
        }
        if (this.failed.indexOf(letter) !== -1) {
            return "Already failed with that letter...";
        }
        return false;
    }

    return this;
}

function registerEvent() {
    if (typeof arguments[0] === 'object') {
        this.callbacks = Object.assign(this.callbacks, arguments[0]);
        return;
    }
    if (typeof arguments[1] === 'function') {
        var ev = arguments[0],
            cb = arguments[1];
        this.callbacks[ev] = cb;
    }
}

function triggerEvent() {
    var
        args = [].slice.call(arguments, 0),
        evt  = args.shift();
    return (this.callbacks[evt] || noop).apply(this, args);
}

function noop(){}
