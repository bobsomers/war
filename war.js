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
    },

    /**
     * Returns the size of the deck (number of cards).
     * This is just a handy alias to the underlying array's length member.
     * @returns The size of the deck, in number of cards.
     */
    size: function() {
        return this.cards.length;
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
        if ((howMany > 1) && (this.deck.size() - howMany) <= 0) {
            howMany = this.deck.size() - 1;
        }

        var cards = [];
        for (var i = 0; i < howMany; i++) {
            cards.push(this.deck.removeFromTop());
        }

        return cards;
    },

    /**
     * Receives an array of cards and adds them all to the player's deck.
     * @param An array of cards to add to the player's deck.
     */
    receive: function (cards) {
        for (var i = 0; i < cards.length; i++) {
            this.deck.addToBottom(cards[i]);
        }
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
        warMode: false
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
    var player = new Player();
    player.deck = new Deck();
    player.deck.addToBottom(new Card({rank: 1, suit: "S"}));
    player.deck.addToBottom(new Card({rank: 2, suit: "H"}));
    player.deck.addToBottom(new Card({rank: 3, suit: "C"}));
    player.deck.addToBottom(new Card({rank: 4, suit: "D"}));

    console.log("Contents of the deck:");
    printCards(player.deck.cards);

    var first = player.take(1);

    console.log("Taking 1 from the deck:");
    printCards(first);
    console.log("Contents of the deck:");
    printCards(player.deck.cards);

    var second = player.take(3);

    console.log("Taking 3 from the deck:");
    printCards(second);
    console.log("Contents of the deck:");
    printCards(player.deck.cards);

    var third = player.take(1);

    console.log("Taking 1 from the deck:");
    printCards(third);
    console.log("Contents of the deck:");
    printCards(player.deck.cards);

    player.receive(second);
    
    console.log("Receiving the second batch of cards:");
    printCards(player.deck.cards);

    player.receive(first);
    
    console.log("Receiving the first batch of cards:");
    printCards(player.deck.cards);

    player.receive(third);

    console.log("Receiving the third batch of cards:");
    printCards(player.deck.cards);
});

function printCards(cards) {
    for (var i = 0; i < cards.length; i++) {
        console.log("\t[" + i + "] " + cards[i].toString());
    }
}
