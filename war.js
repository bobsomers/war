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
        var suits = ["S", "H", "C", "D"];
        for (var suit = 0; suit < suits.length; suit++) {
            for (var rank = 1; rank <= 13; rank++) {
                this.addToBottom(new Card({
                    rank: rank,
                    suit: suits[suit]
                }));
            }
        }
    },

    /**
     * Randomly reorders all the cards in the deck.
     */
    shuffle: function () {
        var newCards = [];

        // run through the whole deck, select a random card each time, and add it to the new deck
        while (this.cards.length > 0) {
            var i = Math.floor(Math.random() * this.cards.length);
            newCards.push(this.cards.splice(i, 1));
        }

        this.cards = newCards;
    },

    /**
     * Removes (and returns) a card from the top of the deck.
     * This is just a handy alias to the underlying array's shift() method.
     * @returns The Card object that was on the top of the deck.
     */
    removeFromTop: function () {
        return this.cards.shift();
    },

    /**
     * Adds a card to the bottom of the deck.
     * This is just a handy alias to the underlying array's push() method.
     * @param card The Card object to add to the bottom of the deck.
     */
    addToBottom: function (card) {
        return this.cards.push(card);
    }
});

/**
 * Represents a player in a game of War.
 */
var Player = new Class({
    Implements: [Options, Events],

    options: {
        deck: new Deck(),
        name: "Player",
        alive: true
    },

    initialize: function (options) {
        this.setOptions(options);
        this.deck = this.options.deck;
        this.name = this.options.name;
        this.alive = this.options.alive;
    },

    /**
     * Removes the specified number of cards from the player's deck and returns them. If you request
     * to take more than one card and taking that many would leave them with nothing, one card is
     * retained to resolve the war.
     * @param howMany The number of cards to take. This is not necessarily how many cards will be returned.
     */
    take: function (howMany) {
        // TODO
    },

    /**
     * Receives an array of cards and adds them all to the player's deck. Also triggers a players
     * death if they have no cards and receive none.
     * @param An array of cards to add to the player's deck.
     */
    receive: function (cards) {
        // TODO
    }
});

/**
 * Implements critical game logic like keeping track of players and wars, as well as what cards are
 * currently on the board. Every time playRound() is called the game will take one card from each
 * player and advance the simulation.
 */
var Game = new Class({
    Implements: [Options, Events],

    options: {
        players: [],
        board: [],
        warChest: [],
        warMode: false;
    },

    initialize: function (options) {
        this.setOptions(options);
        this.players = this.options.players;
        this.board = this.options.board;
        this.wars = this.options.wars;
    },

    /**
     * Plays war! If players are currently in a war it takes 3 cards from each and puts them in the
     * warchest. Otherwise, it takes one card from each to decide the outcome of the round.
     */
    play: function () {
        // TODO
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

    var deck = new Deck();
    deck.createStandard();
    for (var i = 0; i < deck.cards.length; i++) {
        console.log("Card " + i + " is " + deck.cards[i].toString());
    }

    console.log("Shuffling!");
    deck.shuffle();
    for (var i = 0; i < deck.cards.length; i++) {
        console.log("Card " + i + " is " + deck.cards[i].toString());
    }
});
