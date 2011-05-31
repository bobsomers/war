// global variables
var game;
var currentPlayer = 0;
var visualDeckCountOffset = [];
var timer = null;

// helper function for writing text to the status bar
function writeStatus(s) {
    $$('#status h3').setProperty('html', s);
}

// game win handler
function gameWin(player) {
    writeStatus('Player ' + (player + 1) + ' won the game!');

    // make sure they have 52 cards... this is an edge case where you can have some cards sitting
    // in the warchest because the opposing player died during a war
    $$('#player-' + player + '-deck span').setProperty('html', '&times; 52');
}

// autoplays the game
function autoplay() {
    // play a hand
    if (game.warMode) {
        game.play(); // hackity hack...
    }
    game.play();

    // update the visual deck counts
    for (var i = 0; i < game.players.length; i++) {
        $$('#player-' + i + '-deck span').setProperty('html', '&times; ' + game.players[i].deck.size());
    }
}

// autoplay click event handler
function autoplayClicked() {
    if ($('autoplay').getProperty('value') == "on") {
        writeStatus('Autoplaying in the background...');

        // clear ui state and reset deck counts
        var cards = $$('img.cardface');
        for (var i = 0; i < cards.length; i++) {
            cards[i].destroy();
        }
        currentPlayer = 0;
        for (var i = 0; i < game.players.length; i++) {
            visualDeckCountOffset[i] = 0;
        }

        // set autoplay timer
        timer = (function () {
            if (game.playing) {
                autoplay();
            } else {
                clearInterval(timer);
            }
        }).periodical(250);
    } else {
        writeStatus('Resuming live play.');
        clearInterval(timer);
        timer = null;
    }
}

// event handler for starting a war
function warStart(warer1, warer2) {
    if (timer) return; // autoplay

    writeStatus('Player ' + (warer1 + 1) + ' and player ' + (warer2 + 1) + ' started a war!');

    (function () {
        // move the board cards over to the left of the board
        var home = $('hole-0').getPosition();
        var boardCards = $$('img.boardcard');
        for (var i = 0; i < boardCards.length; i++) {
            boardCards[i].set('morph', {
                transition: Fx.Transitions.Bounce.easeOut
            });
            boardCards[i].morph({
                'left': home.x - 85,
                'top': home.y + 2
            });
        }

        // animate a warchest donation from each player
        var wait = 250;
        for (var i = 0; i < game.players.length; i++) {
            var howMany = 3;
            if (game.players[i].deck.size() - 3 <= 0) {
                howMany = game.players[i].deck.size() - 1;
            }

            var home = $('hole-0').getPosition();
            for (var j = 0; j < howMany; j++) {
                (function (i, j, x, y) {
                    var img = new Element('img', {
                        src: 'cards/' + game.players[i].deck.cards[j].toString() + '.png',
                        width: 72,
                        height: 96,
                        alt: game.players[i].deck.cards[j].toString(),
                    });
                    img.addClass('cardface');
                    img.setStyle('position', 'absolute');
                    var pos = $('player-' + i + '-deck').getPosition();
                    img.setStyles({
                        'left': pos.x + 2,
                        'top': pos.y + 2
                    });
                    $$('body').grab(img);
                    img.set('morph', {
                        transition: Fx.Transitions.Bounce.easeOut
                    });
                    img.morph({
                        'left': x,
                        'top': y
                    });

                    // reduce the player's visual deck count by 1
                    visualDeckCountOffset[i] -= 1;
                    $$('#player-' + i + '-deck span').setProperty('html', '&times; ' + (game.players[i].deck.size() + visualDeckCountOffset[i]));
                }).pass([i, j, home.x - 85, home.y + 2]).delay(wait);
                wait += 250;
            }
        }

        // once we're done animating, start collecting cards again
        (function () {
            currentPlayer = 0;
            collectCards();
        }).delay(wait);
    }).delay(1500);
}

// event handler for completion of a hand
function handComplete(winner) {
    if (timer) return; // autoplay

    writeStatus('Player ' + (winner + 1) + ' won the hand!');
    (function () {
        // bounce all the face up cards to the winner's deck
        var home = $('player-' + winner + '-cards').getPosition();
        var faceUpCards = $$('img.cardface');
        for (var i = 0; i < faceUpCards.length; i++) {
            faceUpCards[i].set('morph', {
                transition: Fx.Transitions.Bounce.easeOut,
                onComplete: (function () {
                        this.destroy();
                }).bind(faceUpCards[i])
            });
            faceUpCards[i].morph({
                'left': home.x + 2,
                'top': home.y + 2
            });
        }
        
        // update all the deck counts
        for (var i = 0; i < game.players.length; i++) {
            $$('#player-' + i + '-deck span').setProperty('html', '&times; ' + game.players[i].deck.size());
            visualDeckCountOffset[i] = 0;
        }

        // start collecting cards again for the first player
        currentPlayer = 0;
        collectCards();
    }).delay(1500);
}

// collects cards from the current player via drag and drop
function collectCards() {
    if (currentPlayer >= game.players.length) {
        if (game.warMode) {
            game.play(); // hackity hack...
        }
        game.play();
    } else {
        if (!game.players[currentPlayer].alive) {
            // move on to the next player
            console.log("skipping collection from player " + currentPlayer);
            currentPlayer++;
            collectCards();
            return;
        }

        console.log("collecting cards from player " + currentPlayer);
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
                    var faceUp = new Element('img', {
                        src: 'cards/' + game.players[currentPlayer].deck.cards[0].toString() + '.png',
                        width: 72,
                        height: 96,
                        alt: game.players[currentPlayer].deck.cards[0].toString(),
                    });
                    faceUp.addClass('cardface');
                    faceUp.addClass('boardcard');
                    faceUp.setStyle('position', 'absolute');
                    var pos = $('hole-' + currentPlayer).getPosition();
                    faceUp.setStyles({
                        'left': pos.x + 2,
                        'top': pos.y + 2
                    });
                    $$('body').grab(faceUp);

                    // decrement the player's visual deck size
                    visualDeckCountOffset[currentPlayer] -= 1;
                    $$('#player-' + currentPlayer + '-deck span').setProperty('html', '&times; ' + (game.players[currentPlayer].deck.size() + visualDeckCountOffset[currentPlayer]));

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
                        'top': home.y - 208
                    });
                }
            }
        });
    }
}

// event handler for player select button
function startGameClicked() {
    // create the game and add the proper number of players
    game = new Game();
    var numPlayers = $('num-players').getProperty('value').toInt();
    for (var i = 0; i < numPlayers; i++) {
        game.addPlayer(new Player());
        visualDeckCountOffset[i] = 0;
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
            alt: "Deck",
            'class': 'cardback'
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
    game.addEvent('warstart', warStart);
    $('autoplay').addEvent('click', autoplayClicked);
    game.addEvent('win', gameWin);

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

// start the ball rolling when the dom is ready
window.addEvent('domready', function () {
    $('start-game').addEvent('click', startGameClicked);
});
