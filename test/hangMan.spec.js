'use strict';

const HangMan = require("../hangMan.js");
const expect = require("chai").expect;

describe("HangMan game", function() {

    describe("Word acceptance", function() {
        it("should accept single words, only alphabetic", function() {
            const g = new HangMan("word");
            expect(g instanceof HangMan).to.eql(true);
        });
        it("should reject str with spaces", function() {
            const instanceWithError = () =>{
                const g = new HangMan("wo rd");
            };
            expect(instanceWithError).to.throw("Invalid word");
        });
        it("should reject str with non-alphabetic", function() {
            const instanceWithError = () =>{
                const g = new HangMan("wo_r13d");
            };
            expect(instanceWithError).to.throw("Invalid word");
        });
    });

    describe("Instance", function() {
        // @TODO maybe should refactor using prototypal inheritance?
        it("should expose public API", function() {
            var g = new HangMan("someword");
            var publicAPI = Object.keys(g);
            expect(publicAPI).to.eql([ 'failed', 'guessed', 'on', 'try', 'hazard' ]);
        });

        it("should expose public methods", function() {
            var g = new HangMan("someword");
            const methodOf = (instance) => (key) => typeof instance[key] === 'function';
            let methods = Object.keys(g).filter(methodOf(g));
            expect(methods).to.eql(['on', 'try', 'hazard']);
        });

    });

    describe("Basic gameplay", function() {
        describe("Win", function() {
            var g;
            beforeEach(function() {
                g = new HangMan("mississipi");
            });
            it("should win", function() {
                g.try("m");
                g.try("i");
                g.try("s");
                g.try("p");
                // assertion ?
            });
        });

        describe("Hang", function() {
            var g;
            beforeEach(function() {
                g = new HangMan("mississipi");
            });
            it("should lose", function() {
                g.try("e");
                g.try("a");
                g.try("o");
                g.try("d");
                g.try("q");
                g.try("f");
                // assertions ?
            });
        });

    });

});
