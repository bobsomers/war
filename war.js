/**
 * Mixin class for comparing cards in a suitless matter with "ace high" value.
 */
var AceHighSuitlessCompare = new Class({
    /**
     * Compares two cards only by their rank.
     * @param other The other card you are comparing to this one.
     * @returns A positive integer if THIS (not other!) card is greater, a negative integer if the other card is greater, and 0 if they are equal.
     */
    compare: function (other) {
        // move the ace up in value to reflect "ace high" value
        var thisRank = (this.rank == 1) ? 14 : this.rank;
        var otherRank = (other.rank == 1) ? 14 : other.rank;

        return thisRank - otherRank;
    }
});

/**
 * Representation of a standard playing card. Valid ranks are from 1-13 (Ace through King) and valid
 * suits are the strings "H", "S", "C", and "D" for hearts, spades, clubs, and diamonds respectively.
 */
var Card = new Class({
    Implements: [Options, Events, AceHighSuitlessCompare],

    options: {
        rank: 0,
        suit: "X"
    },

    initialize: function (options) {
        this.setOptions(options);
        this.rank = this.options.rank;
        this.suit = this.options.suit;
    },

    /**
     * Converts this card to its corresponding string representation.
     * @returns A string with the rank followed immediately by a single character for the suit.
     */
    toString: function () {
        var rankStr = "";
        switch (this.rank) {
            case 1:
                rankStr = "A";
                break;

            case 11:
                rankStr = "J";
                break;

            case 12:
                rankStr = "Q";
                break;

            case 13:
                rankStr = "K";
                break;

            default:
                rankStr = "" + this.rank;
        }

        return rankStr + this.suit;
    }
});

/**
 * Represents a deck of playing cards. By default the deck is empty when it's created. If you'd like
 * it to contain a standard set of US playing cards, you can use the createStandard() method after
 * construction to do so.
 */
var Deck = new Class({
    Implements: [Options, Events],

    options: {
        cards: []
    },

    initialize: function (options) {
        this.setOptions(options);
        this.cards = this.options.cards;
    },

    /**
     * Fills the deck with a standard set of playing cards, ace through king of spades, hearts,
     * clubs, and diamonds.
     */
    createStandard: function () {

    },

    /**
     * Randomly reorders all the cards in the deck.
     */
    shuffle: function () {

    },

    /**
     * Removes (and returns) a card from the top of the deck.
     * @returns The Card object that was on the top of the deck.
     */
    pop: function () {

    },

    /**
     * Adds a card to the bottom of the deck.
     */
    push: function () {

    }
});

window.addEvent('domready', function () {
    var aceOfSpades = new Card({
        rank: 1,
        suit: "S"
    });

    var twoOfDiamonds = new Card({
        rank: 2,
        suit: "D"
    });

    var sevenOfHearts = new Card({
        rank: 7,
        suit: "H"
    });

    var kingOfClubs = new Card({
        rank: 13,
        suit: "C"
    });
    
    console.log("Comparing " + twoOfDiamonds.toString() + " to " + sevenOfHearts.toString() + ": " +
        twoOfDiamonds.compare(sevenOfHearts));
   
    console.log("Comparing " + sevenOfHearts.toString() + " to " + twoOfDiamonds.toString() + ": " +
        sevenOfHearts.compare(twoOfDiamonds));
    
    console.log("Comparing " + twoOfDiamonds.toString() + " to " + twoOfDiamonds.toString() + ": " +
        twoOfDiamonds.compare(twoOfDiamonds));
    
    console.log("Comparing " + aceOfSpades.toString() + " to " + twoOfDiamonds.toString() + ": " +
        aceOfSpades.compare(twoOfDiamonds));

    console.log("Comparing " + kingOfClubs.toString() + " to " + aceOfSpades.toString() + ": " +
        kingOfClubs.compare(aceOfSpades));
});
