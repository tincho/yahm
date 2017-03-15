var
    words      = ["steam", "mulch", "grasshoper", "placide"],
    randomWord = words[Math.floor(Math.random() * words.length)],
    $          = document.querySelector.bind(document),
    $getInput  = document.querySelector.bind(document, "input.try:enabled");

Element.prototype.appendAfter = function(element) {
    element.parentNode.insertBefore(this, element.nextSibling);
    return this;
};

(function init() {
    window.game = new HangMan(randomWord);
    game.on({
        fail  : onFail,
        guess : onGuess,
        saved : onSaved,
        dead  : onDead
    });
    showRevealed();
    setupInput();
})();

function setupInput() {
    var tryLetter = game.try.bind(game);
    $getInput()
        .addEventListener("change", compose(
            myProperty("target.value"),
            tryLetter // ES6/7 ::game.try
        ));
}

function onFail(part, left) {
    $(".man__part."+part).innerText = part;
    $(".info").innerText = left.length + " chances";

    var $input = $getInput();
    $input.disabled = true;
    $input.style.display = "inline-block";

    var $newI = $input.cloneNode();
    $newI.style.display = "block";
    $newI.value = "";
    $newI.disabled = false;
    $newI.appendAfter($input).focus();
    setupInput();
}

function onGuess(guessed) {
    $getInput().value = "";
    showRevealed();
}

function onSaved(word) {
    debugger
    console.log(arguments);
    alert("Youre saved! It was " + word);
}

function onDead(word) {
    debugger
    console.log(arguments);
    $(".guessed").innerText = word.split("").join(",");
    alert("Youre DEAD! It was " + word);
}

function showRevealed() {
    var guessed = [];
    for(var i = 0; i < game.guessed.length; i++) {
        guessed[i] = typeof game.guessed[i] === 'undefined' ? '_' : game.guessed[i];
    }
    // var guessed = game.guessed.map(l => typeof l === 'undefined' ? '_' : l);
    $(".guessed").innerText = guessed.join(" ");
}

// functional utilitiy belt
function myProperty() {
    var getters = mkGetters([].slice.call(arguments));
    return compose.apply(null, getters);

    function mkGetters(args) {
        var keys = args;
        if (args.length === 1) {
            keys = args[0];
            if (!Array.prototype.isPrototypeOf(keys)) {
                keys = args[0].split(".");
            }
        }
        return keys.map(function(key) {
            // return get.bind(null)
            // return partial(get, obj, key)
            return function(obj) {
                return obj[key];
            }
        });
    }
}

function compose() {
    var fs = Array.prototype.slice.call(arguments);
    return function(x) {
        return fs.reduce(function(p, f) {
            return f(p);
        }, x);
    }
}
