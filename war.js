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
            if (cards[i] != null) {
                this.deck.addToBottom(cards[i]);
            }
        }
    },

    kill: function () {
        this.alive = false;

        // TODO: more things when a player dies
        playing = false;
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
        warMode: false,
        playing: true
    },

    initialize: function (options) {
        this.setOptions(options);
        this.players = this.options.players;
        this.board = this.options.board;
        this.warChest = this.options.warChest;
        this.warMode = this.options.warMode;
        this.playing = this.options.playing;
    },

    /**
     * Adds a player to the list of players in the game.
     * @param player The player to add.
     */
    addPlayer: function (player) {
        this.players.append(Array.from(player));
    },

    /**
     * Plays war! If players are currently in a war it takes 3 cards from each and puts them in the
     * warchest. Otherwise, it takes one card from each to decide the outcome of the round.
     */
    play: function () {
        console.log("Players deck counts:");
        for (var i = 0; i < this.players.length; i++) {
            console.log("\t[" + i + "] " + this.players[i].deck.cards.length);
        }
              
        if (this.warMode) {
            // take three cards from each player add it to the warchest stack
            var booty = [];
            for (var i = 0; i < this.players.length; i++) {
                if (this.players[i].alive) {
                    booty[i] = this.players[i].take(3);
                } else {
                    booty[i] = null; // still need to pad this spot
                }
            }
            this.warChest.push(booty);

            this.warMode = false;

            // for debugging purposes, print the contents of warchest
            // TODO remove me!
            console.log("War chest contents:");
            printCards(this.warChest.flatten());
        } else {
            // take one card from each player and place it on the board
            for (var i = 0; i < this.players.length; i++) {
                if (this.players[i].alive) {
                    this.board[i] = this.players[i].take(1)[0];
                } else {
                    this.board[i] = null; // still need to pad this spot
                }
            }

            console.log("Collected cards:");
            printCards(this.board);

            // make a linear pass over the board for the top two cards
            var firstCard = null;
            var firstPlayer = -1;
            var secondCard = null;
            var secondPlayer = -1;
            for (var i = 0; i < this.board.length; i++) {
                // ignore "null" cards (from dead players)
                if (this.board[i] == null) {
                    continue;
                }

                // if the first best hasn't been filled, fill it
                if (firstCard == null) {
                    firstCard = this.board[i];
                    firstPlayer = i;
                    continue;
                }

                // is this card the new first best?
                if (this.board[i].compare(firstCard) > 0) {
                    secondCard = firstCard;
                    secondPlayer = firstPlayer;
                    firstCard = this.board[i];
                    firstPlayer = i;
                    continue;
                }

                // if the second best hasn't been filled, fill it
                if (secondCard == null) {
                    secondCard = this.board[i];
                    secondPlayer = i;
                    continue;
                }

                // is this card the new second best?
                if (this.board[i].compare(secondCard) > 0) {
                    secondCard = this.board[i];
                    secondPlayer = i;
                    continue;
                }
            }

            // if the two top cards are equal in value, we have a war! otherwise, we award all the
            // cards on the board and in the warchest to the top card
            if (firstCard.compare(secondCard) == 0) {
                console.log("Players " + firstPlayer + " and " + secondPlayer + " started a war with " + firstCard.toString() + " and " + secondCard.toString()); 

                this.warMode = true;

                // add the contents of the board to the warchest
                this.warChest.append(this.board);
                this.board = [];
            } else {
                console.log("Player " + firstPlayer + " wins the hand with " + firstCard.toString());
                
                // winning player gets all the cards on the board
                this.players[firstPlayer].receive(this.board);
                this.board = [];

                // winning player gets all the cards in the warchest
                var temp = this.warChest.flatten();
                this.players[firstPlayer].receive(temp);
                this.warChest = [];
            }

            // check for win condition
            this.checkWin();
        }
    },

    /**
     * Kills any players that have no cards left in their deck and checks to see if we only have one
     * live player left.
     */
    checkWin: function () {
        // kill any alive players who have no more cards left
        var numLivePlayers = 0;
        var lastLivePlayer = -1;
        for (var i = 0; i < this.players.length; i++) {
            if (this.players[i].alive) {
                if (this.players[i].deck.cards.length <= 0) {
                    this.players[i].kill();
                } else {
                    lastLivePlayer = i;
                    numLivePlayers += 1;
                }
            }
        }

        if (numLivePlayers == 1) {
            console.log("Player " + lastLivePlayer + " won!");
            this.playing = false;
            
            // TODO: various "you won!" things...
        }
    } 
});

/*
var game;
var timer;

window.addEvent('domready', function () {
    // create the players and the game
    var p1 = new Player();
    var p2 = new Player();
    var p3 = new Player();
    var p4 = new Player();
    var p5 = new Player();
    game = new Game();
    game.addPlayer(p1);
    game.addPlayer(p2);
    game.addPlayer(p3);
    game.addPlayer(p4);
    game.addPlayer(p5);

    // create a new deck and deal the players cards
    var deck = new Deck();
    deck.createStandard();
    deck.shuffle();
    var togglePlayers = 0;
    var numCards = deck.cards.length;
    for (var i = 0; i < numCards; i++) {
        if (togglePlayers == 0) {
            p1.receive(Array.from(deck.removeFromTop()));
        } else if (togglePlayers == 1) {
            p2.receive(Array.from(deck.removeFromTop()));
        } else if (togglePlayers == 2) {
            p3.receive(Array.from(deck.removeFromTop()));
        } else if (togglePlayers == 3) {
            p4.receive(Array.from(deck.removeFromTop()));
        } else {
            p5.receive(Array.from(deck.removeFromTop()));
        }
        togglePlayers = (togglePlayers + 1) % 5;
    }

    console.log("Starting a FIVE WAY game of War! This is pretty ridiculous...");

    console.log("First player's starting deck:");
    printCards(p1.deck.cards);

    console.log("Second player's starting deck:");
    printCards(p2.deck.cards);

    console.log("Third player's starting deck:");
    printCards(p3.deck.cards);
    
    console.log("Fourth player's starting deck:");
    printCards(p4.deck.cards);
    
    console.log("Fifth player's starting deck:");
    printCards(p5.deck.cards);

    timer = (function () {
        if (game.playing) {
            game.play();
        } else {
            clearInterval(timer);
        }
    }).periodical(250);
});

function printCards(cards) {
    for (var i = 0; i < cards.length; i++) {
        if (cards[i] == null) {
            console.log("\t[" + i + "] null");
        } else {
            console.log("\t[" + i + "] " + cards[i].toString());
        }
    }
}
*/
