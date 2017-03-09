'use strict';
if (typeof window === 'undefined') {
    require("./Object.assign.js");
    module.exports = HangMan;
}

Array.prototype.clone = function() {
    return this.slice(0);
}
String.prototype.find = function findInThis(char, onMatch) {
    return findIn(this, char, onMatch);
};

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

        letter = letter.toLowerCase();

        var invalid = invalidInput.call(this, letter);
        if (invalid !== false) {
            throw new Error("Invalid letter");
            return invalid;
        }


        if (findIn(guessed, letter)) return; // @TODO some event for maybe the frontend to know if should do some animation (?)

        var found = deliveranceWord.find(letter, setKeyValueTo(guessed));

        return [
            failLetter.bind(this, letter),
            guessLetter.bind(this)
        ][+found];

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

    function failLetter(letter) {
        this.failed.push(letter);
        var part = bodyParts.shift();
        drawnParts.push(part);
        trigger("fail", part, bodyParts.clone());

        if (!bodyParts.length) {
            hang();
        }
    }

    function guessLetter() {
        this.guessed = guessed.clone();
        // for safety:
        // tryLetter checks against guessed
        // and win is checked against guessed
        // if instance.guessed contains a reference to that "private" var
        // it could be modified from outside
        // but i'm doing it twice !
        trigger("guess", this.guessed);

        if ( guessed.join("") === deliveranceWord ) {
            save();
        }
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

function findIn(collection, item, onMatch) {
    var pos = -1, found = false;
    while ((pos = collection.indexOf(item, pos + 1)) !== -1 ) {
        found = true;
        (typeof onMatch === 'function') && onMatch(pos, item);
    }
    return found;
}

function setKeyValueTo(target) {
    return function(key, value) {
        target[key] = value;
        return target; // ?
    }
}


function noop(){}
