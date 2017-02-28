var
    words      = ["steam", "mulch", "grasshoper", "placide"],
    randomWord = words[Math.floor(Math.random() * words.length)],
    $          = document.querySelector.bind(document);

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
    setupInput();
})();

function setupInput() {
    $("input.try:enabled")
        .addEventListener("change", compose(
            //bfore i was like:
            //get("target"),
            //get("value"),
            //but then i got refactor'd
            get("target.value"),
            game.try.bind(game) // ES6/7 ::game.try
        ));
}

function onFail(part, left) {
    $(".man__part."+part).innerText = part;
    $(".info").innerText = left.length + " chances";

    var $input = $("input.try:enabled");
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
    var $input = $("input.try:enabled");
    $input.value = "";

    $(".guessed").innerText = guessed.toString();
}

function onSaved() {
    debugger
}

function onDead() {
    debugger
}


// functional utilitiy belt
function get() {
    var
        args    = [].slice.call(arguments),
        getters = mkGetters(args);

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
