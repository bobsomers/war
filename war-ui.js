// global variables
var game;
var currentPlayer = 0;
var faceUpCards = [];

// helper function for writing text to the status bar
function writeStatus(s) {
    $$('#status h3').setProperty('html', s);
}

function handComplete(winner) {
    writeStatus('Player ' + (winner + 1) + ' won the hand!');
    
    // bounce all the face up cards to the winner's deck
    var home = $('player-' + winner + '-cards').getPosition();
    for (var i = 0; i < faceUpCards.length; i++) {
        faceUpCards[i].setStyle('position', 'absolute');
        faceUpCards[i].set('morph', {
            transition: Fx.Transitions.Bounce.easeOut,
        });
        faceUpCards[i].morph({
            'left': home.x,
            'top': home.y
        });
    }
}

function collectCards() {
    if (currentPlayer >= game.players.length) {
        game.play();
    } else {
        console.log("collecting cards from player " + currentPlayer);
        if (game.warMode) {
            // do a "war mode" collection from the player
            // TODO
        } else {
            // do a routine collection from the player
            writeStatus('Player ' + (currentPlayer + 1) + '\'s turn. Drag a card from your deck to your position ' + (currentPlayer + 1) + ' on the board.');
            var img = $$('#player-' + currentPlayer + '-cards img');
            img.addEvent('mousedown', function () {
                if (game.players[currentPlayer].deck.size() > 1) {
                    $('player-' + currentPlayer + '-cards').grab(new Element('img', {
                        src: 'cards/back.png',
                        width: 72,
                        height: 96,
                        alt: 'Deck'
                    }));
                }
            });
            img.addEvent('mouseup', function () {
                if (game.players[currentPlayer].deck.size() > 1) {
                    $('player-' + currentPlayer + '-cards').getLast('img').dispose();
                }
            });
            img.makeDraggable({
                droppables: $('hole-' + currentPlayer),
                snap: 0,
                onDrop: function (draggable, droppable) {
                    if (droppable) {
                        // eat this card image
                        draggable.destroy();

                        // add a new card to the player's deck if they have at least 2 cards left
                        if (game.players[currentPlayer].deck.size() > 1) {
                            $('player-' + currentPlayer + '-cards').grab(new Element('img', {
                                src: 'cards/back.png',
                                width: 72,
                                height: 96,
                                alt: 'Deck'
                            }));
                        }

                        // replace the hole for this player with their deck's top card
                        var hole = $('hole-' + currentPlayer);
                        hole.setProperty('html', '');
                        var faceUp = new Element('img', {
                            src: 'cards/' + game.players[currentPlayer].deck.cards[0].toString() + '.png',
                            width: 72,
                            height: 96,
                            alt: game.players[currentPlayer].deck.cards[0].toString()
                        });
                        hole.grab(faceUp);

                        // add the face up card to the list of face up cards
                        faceUpCards.push(faceUp);

                        // decrement the player's visual deck size
                        $$('#player-' + currentPlayer + '-deck span').setProperty('html', '&times; ' + (game.players[currentPlayer].deck.size() - 1));

                        // collect cards for the next player
                        currentPlayer++;
                        collectCards();
                    } else {
                        // bounce the card back to the deck
                        var home = $('player-' + currentPlayer + '-cards').getPosition();
                        draggable.set('morph', {
                            transition: Fx.Transitions.Bounce.easeOut,
                        });
                        draggable.morph({
                            'left': home.x + 2,
                            'top': home.y - 158
                        });
                    }
                }
            });
        }
    }
}

// event handler for player select button
function startGameClicked() {
    // create the game and add the proper number of players
    game = new Game();
    var numPlayers = $('num-players').getProperty('value').toInt();
    for (var i = 0; i < numPlayers; i++) {
        game.addPlayer(new Player());
    }
    
    // deal a new game
    var deck = new Deck();
    deck.createStandard();
    deck.shuffle();
    var whichPlayer = 0;
    var numCards = deck.cards.length;
    for (var i = 0; i < numCards; i++) {
        game.players[whichPlayer].receive(Array.from(deck.removeFromTop()));
        whichPlayer = (whichPlayer + 1) % numPlayers;
    }

    // generate markup for each player's hole in the board
    for (var i = 0; i < numPlayers; i++) {
        $('hole').grab(new Element('div', {
            id: 'hole-' + i,
            'class': 'hole',
            html: i + 1
        }));
    }
    
    // generate markup for each player
    for (var i = 0; i < numPlayers; i++) {
        var img = new Element('img', {
            src: 'cards/back.png',
            width: 72,
            height: 96,
            alt: "Deck"
        });
        var cards = new Element('div', {
            id: 'player-' + i + '-cards',
            'class': 'cards'
        });
        var count = new Element('span', {
            html: '&times; ' + game.players[i].deck.size()
        });
        var deck = new Element('div', {
            id: 'player-' + i + '-deck',
            'class': 'deck'
        });
        var title = new Element('h2', {
            html: 'Player ' + (i + 1)
        });
        var player = new Element('div', {
            id: 'player-' + i,
            'class': 'player'
        });
        cards.grab(img);
        deck.grab(cards);
        deck.grab(count);
        player.grab(title);
        player.grab(deck);
        $('players').grab(player);
    }

    // inject necessary calculated styles into the stylesheet
    // (these are noted in style.css)
    $('hole').setStyle('margin-left', -1 * (((numPlayers * (72 + 4)) + ((numPlayers - 1) * 20)) / 2));
    $$('div.player').setStyle('width', ((100 - ((numPlayers + 1) * 2)) / numPlayers) + '%');

    // hook up game event handlers
    game.addEvent('handcomplete', handComplete);

    // animate out the player select panel
    $('player-select').morph({
        'opacity': [1, 0],
        'top': 0
    });
    
    // animate in the game board
    var board = $('board');
    board.setStyle('opacity', 0);
    board.setStyle('display', 'block');
    board.morph({
        'opacity': [0, 1]
    });

    // animate in the players panel
    var players = $('players');
    players.setStyle('opacity', 0);
    players.setStyle('display', 'block');
    players.morph({
        'opacity': [0, 1]
    });

    // animate in the status bar
    var statusBar = $('status');
    statusBar.setStyle('opacity', 0);
    statusBar.setStyle('display', 'block');
    statusBar.morph({
        'opacity': [0, 1]
    });

    // kick things off by collecting cards from the first player
    collectCards();
}

window.addEvent('domready', function () {
    // hook up first event handler to get the ball rolling
    $('start-game').addEvent('click', startGameClicked);
});
