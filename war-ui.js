// global variables
var game;

// helper function for writing text to the status bar
function writeStatus(s) {
    $$('#status h3').setProperty('html', s);
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
}

/* domready event */
window.addEvent('domready', function () {
    $('start-game').addEvent('click', startGameClicked);
});
