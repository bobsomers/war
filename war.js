var Card = new Class({
    Implements: [Options, Events],
    options: {
        rank: 0,
        suit: "X"
    },

    initialize: function (options) {
        this.setOptions(options);
        this.rank = this.options.rank;
        this.suit = this.options.suit;
    },

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

var Deck = new Class({
    Implements: [Options, Events],
    options: {},

    initialize: function (options) {

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

    var kingOfClubs = new Card({
        rank: 13,
        suit: "C"
    });
    
    console.log("Ace of spades: " + aceOfSpades.toString());
    console.log("Two of diamonds: " + twoOfDiamonds.toString());
    console.log("King of clubs: " + kingOfClubs.toString());
});
