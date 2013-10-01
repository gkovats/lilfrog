/**
 * wordfind.js
*/
LF.activities.wordfind = {

  /**
   * The WordSearch game object, which contains core game logic
   * @param {object} element        DOM Reference for widget to load within
   * @param {array} instanceConfig  Config parameters to use for new game
   * @namespace
   */
  Game: function(element, instanceConfig) {
    var version = 1,

    /**
     * Tracks user score, time and other game pertinent info
     */
    user = {
      score: 0,
      time: 0,
      timeStart: 0
    },

    /**
     * Interval timer during active game
     */
    heartbeat = {},

    /**
     * selection Object - tracks what the user is selecting
     */
    selection = {
      x: 0,
      y: 0,
      x2: 0,
      y2: 0,
      selecting: false
    },

    /**
     * Configuration params with defaults
     */
    config = {
      height: 12, // height in grid squares
      width: 12, // width in grid squares
      words: [] // on init, this gets transferred to the words property
    },

    /**
     * DOM pointers object
     */
    dom = {
      wf: '', // whole wordfinder wrapper
      board: '', // board Dom element
    },

    /**
     * GridBoard instance
     */
    grid = {},

    /**
     * Collection of words
     */
    words = {},

    /**
     * Running count of remaining words to find
     */
    wordsLeft = 0;

    /**
     * Abstraction for grid's loadword
     */
    function loadWord (rawWord) {
      var self = this, line;
      word = rawWord.toLowerCase().replace(/\W+/g,'');
      line = grid.loadWord(word);
      if (!line) { return false; }
      words[word] = {
        line: line,
        found: false,
        text: rawWord
      };
      // add word to words board
      dom.words.append('<li data-word="'+word+'">'+rawWord+'</li>');
      return true;
    };

    /**
     * Mouse & Touch event handlers
     * @param {array} event     Mouse event
     * @return {boolean} Success
     */
    function mouseTrack (event) {
      var self = this,
        eventPos = event,
        offset = dom.canvas.control.offset(),
        x, y;
      // Conversion for touch events as needed
      eventPos = (event.originalEvent.touches && event.originalEvent.touches.length) ? event.originalEvent.touches[0] : event;
      if (typeof eventPos.pageX != 'undefined') {
        x = grid.getX(eventPos.pageX - offset.left),
        y = grid.getY(eventPos.pageY - offset.top);
      } else {
        x = selection.x2;
        y = selection.y2;
      }
      switch (event.type) {
        case 'mousedown':
        case 'touchstart':
          // Mouse button is down
          selection.y = y;
          selection.x = x;
          selection.selecting = true;
          // Turn on hover tracking
          dom.canvas.control.on('mousemove touchmove', function(event) {
            mouseTrack(event);
          });
          break;
        case 'mousemove':
        case 'touchmove':
          // Handle mouse hovering
          if (selection.x2 != x || selection.y2 !=y) {
            selection.x2 = x;
            selection.y2 = y;
            // LF.log('Hover: '+x+','+y);
            grid.highlightLine( grid.getLine(selection.y, selection.x, y, x));
          }
          break;
        case 'mouseup':
        case 'touchend':
          // Mouse button released
          selection.selecting = false;
          dom.canvas.control.off('mousemove touchmove'); // release hover event
          // if doubleclicked, toss out
          if (selection.x == x && selection.y == y) {
            return false;
          }
          var line = grid.getLine(selection.y, selection.x, y, x);
          // now check word
          checkSelection( line.y, line.x, line.y2, line.x2 );
          grid.clearControl();
          break;
      }
      return true;
    }

    function updateHeader () {
      var min = 0, sec;
      if (user.timeStart) {
        user.time = Math.round(((+ new Date()) - user.timeStart) / 1000);
      }
      min = Math.floor(user.time / 60);
      sec = user.time % 60;
      sec = sec < 10 ? '0' + sec : sec;
      dom.header.time.text('Time: ' + min + ':' + sec);
      dom.header.points.text(user.score + ' points');
    }

    /**
     * Checks current selection to see if it's on a word
     *
     * @param {integer} y   Y coordinate
     * @param {integer} x   X coordinate
     * @param {integer} y2   Y2 coordinate
     * @param {integer} x2   X2 coordinate
     * @returns {boolean} Success
     */
    function checkSelection (y, x, y2, x2) {
      var self = this, w, word, line;

      for (word in words) {
        // skip found words
        if (words[word].found) { continue; }

        line = words[word].line;
        LF.log('Checking word: '+ word, line);
        if ( (x == line.x && y == line.y && x2 == line.x2 && y2 == line.y2) ||
            (x2 == line.x && y2 == line.y && x == line.x2 && y == line.y2) ) {
          return foundWord(word, true);
        }
      }

      dom.header.message.text('Word not found there.');
      return false;
    }

    /**
     * Reveals a word hidden on the board
     * @param {string}  word    Word that was found
     * @param {boolean} award   Should points be awarded, or was it just revealed?
     */
    function foundWord (word, award) {
      award = award || false;
      if (!words[word] || words[word].found) {
        return false;
      }
      if (award) {
        dom.header.message.html('You found <b>' + words[word].text + '</b>!');
        // @TODO: award points
        var bonus = {
          time: 0,
          orientation: 0,
          length: 0
        }
        // determine time bonus
        if (user.time < 30) {
          bonus.time = 100;
        } else if (user.time < 60) {
          bonus.time = 50;
        } else if (user.time < 90) {
          bonus.time = 20;
        }
        // determine orientation bonus
        switch (words[word].line.d) {
          case 0: bonus.orientation = 10; break;
          case 1: bonus.orientation = 20; break;
          case 2: bonus.orientation = 0; break;
          case 3: bonus.orientation = 20; break;
          case 4: bonus.orientation = 10; break;
          case 5: bonus.orientation = 30; break;
          case 6: bonus.orientation = 20; break;
          case 7: bonus.orientation = 40; break;
        }
        // determine length bonus
        if (word.length < 4) {
          bonus.length = 20;
        } else if (word.length < 6) {
          bonus.length = 10;
        }
        user.score += 100 + bonus.length + bonus.orientation + bonus.time;
        updateHeader();
      }
      words[word].found = true;
      // highlight line on board
      grid.highlightBoard(words[word].line);
      // cross off the word list
      dom.words.find('li[data-word='+word+']').addClass('found');
      wordsLeft--; // decrement found counter
      isGameComplete();
      return true;
    }

    /**
     * Reveals a word hidden on the board
     */
    function revealWord (wordRef) {
      var self = this, word = '';
      if (typeof wordRef == 'string') {
        word = wordRef;
      } else {
        word = $(wordRef).attr('data-word');
      }
      foundWord(word);
    }

    /**
     * Performs check to see if game is complete and initiates prompt to start new game
     */
    function isGameComplete () {
      if (wordsLeft > 0) {
        return false;
      }
      // game is complete
      dom.dialog.html('<p>You\'ve completed this board. </p><button class="btn-large">Start New Game</button>');
      dom.dialog.show();
      dom.dialog.find('button').on('click', function(e){
        e.preventDefault();
        startNewGame();
      });
      clearInterval(heartbeat);
      return true;
    }

    /**
     * Start new game
     * @param {array} [optional]    List of words to use for next game
     */
    function startNewGame(words){
      // Init grid
      wordsLeft = 0;
      dom.dialog.hide(); // hide any dialog
      grid.reset();
      var wordLists = [
        ['blueberry muffin' ,'peanut brittle' ,'custard' ,'trifle' ,'yellow cake' ,'pastry' ,'icing' ,'sponge cake' ,'sweet potato pie' ,'scone' ,'fortune cookie' ,'parfait' ,'jellyroll' ,'doughnut' ,'sherbet' ,'truffle' ,'sorbet' ,'torte' ,'caramel apple' ,'bombe' ,'fudge' ,'banana split' ,'red velvet cake' ,'cherry pie' ,'eclair' ,'ladyfingers' ,'lemon bars' ,'marshmallow' ,'snickerdoodle' ,'biscotti'],
        ['oatmeal cookie' ,'ambrosia' ,'jelly' ,'sugar cookie' ,'fruit cake' ,'apple pie' ,'vanilla pudding' ,'pie' ,'pancakes' ,'cupcake' ,'churro' ,'baked apple' ,'pumpkin pie' ,'cheesecake' ,'popover' ,'frosting' ,'dessert' ,'muffin' ,'Belgian waffle' ,'upside-down cake' ,'coconut cake' ,'toffee' ,'honey' ,'sugar' ,'molasses' ,'frozen yogurt' ,'watermelon ice' ,'jam' ,'brownie' ,'ice cream'],
        ['macaroon' ,'rhubarb pie' ,'panna cotta' ,'pecan pie' ,'bread pudding' ,'smores' ,'gingersnaps' ,'quick bread' ,'vanilla cream pie' ,'gelatin' ,'cookie' ,'carrot cake' ,'cinnamon roll' ,'pound cake' ,'Danish pastry' ,'strudel' ,'mousse' ,'Key lime pie' ,'coffee cake' ,'soda bread' ,'popcicle' ,'devils food cake' ,'sundae' ,'meringue' ,'rice pudding' ,'baklava' ,'shortbread' ,'fruit salad' ,'gingerbread' ,'turnover'],
        ['apple crisp' ,'fruit cocktail' ,'French toast' ,'soda' ,'nut brittle' ,'praline' ,'cake' ,'cobbler' ,'sweet roll' ,'raisin bread' ,'milkshake' ,'tart' ,'butterscotch' ,'flan' ,'cannoli' ,'tapioca pudding' ,'pudding' ,'gelato' ,'waffle' ,'souffle' ,'chocolate bar' ,'dumplings' ,'almond cookie' ,'nougat' ,'spumoni' ,'poached pears' ,'fritter'],
        ['guava' ,'mulberry' ,'mango' ,'pineapple' ,'lime' ,'lingonberry' ,'tangelo' ,'pomelo' ,'plantain' ,'berry' ,'nectarine' ,'lemon' ,'blackberry' ,'prune' ,'durian' ,'orange' ,'apple' ,'watermelon' ,'pluot' ,'date' ,'grape' ,'star fruit' ,'mandarin orange' ,'plum' ,'pomegranite' ,'avocado' ,'citrus' ,'citron' ,'grapefruit' ,'apricot' ,'passion fruit' ,'ugli fruit'],
        ['cherry' ,'breadfruit' ,'tangerine' ,'honeydew' ,'blueberry' ,'blood orange' ,'strawberry' ,'lychee' ,'loquat' ,'peach' ,'raspberry' ,'coconut' ,'dragonfruit' ,'papaya' ,'marionberry' ,'persimmon' ,'kiwi' ,'crabapple' ,'current' ,'pear' ,'cantaloupe' ,'raisin' ,'jackfruit' ,'cranberry' ,'banana' ,'fig' ,'elderberry' ,'kumquat' ,'quince' ,'boysenberry'],
        ['waves' ,'life preserver' ,'paddleboat' ,'shark' ,'shore' ,'scuba' ,'snacks' ,'sea' ,'hermit crab' ,'bikini' ,'shorebirds' ,'dive' ,'hat' ,'S cont.' ,'coral' ,'volleyball' ,'wharf' ,'dune buggy' ,'sunbathe' ,'sand' ,'shell' ,'intertidal zone' ,'surf' ,'sandcastle' ,'popsicle' ,'zoris' ,'lagoon' ,'seagull' ,'swimming cap' ,'underwater'],
        ['dock' ,'tide pool' ,'beachball' ,'sandals' ,'ship' ,'low tide' ,'rip current' ,'umbrella' ,'mussels' ,'crab' ,'sun hat' ,'tide' ,'clam' ,'tan' ,'salt water' ,'hang five' ,'spray' ,'neap tide' ,'sailboat' ,'beach' ,'yacht' ,'barnacle' ,'snorkel' ,'water bottle' ,'palm tree' ,'fish' ,'pier' ,'ocean' ,'lifeguard'],
        ['boat' ,'mangrove' ,'fishing' ,'ebb tide' ,'island' ,'rest' ,'lakeshore' ,'soft serve ice cream' ,'towel' ,'high tide' ,'pelican' ,'sail' ,'weekend' ,'wet' ,'vacation' ,'trip' ,'cove' ,'cape' ,'sunglasses' ,'ice cream' ,'kelp' ,'salt water taffy' ,'cooler' ,'lake' ,'bay'],
        ['whitecaps' ,'suntan' ,'fins' ,'tsunami' ,'Frisbee' ,'catamaran' ,'starfish' ,'gull' ,'boogie board' ,'sea star' ,'bathing suit' ,'trunks' ,'taffy' ,'dune' ,'undertow' ,'sun' ,'currents' ,'sand dollar' ,'longboard' ,'clam bake' ,'seashell' ,'relax' ,'coast' ,'sunscreen' ,'life jacket' ,'surfboard' ,'water' ,'sunburn' ,'swim' ,'reef']
      ];
      if (typeof words != 'object') {
        words = wordLists[LF.getRand(wordLists.length-1)];
      }
      dom.words.html('<p>Click on word to reveal its location</p>');
      dom.header.message.html('');
      config.words = words;
      // Load words
      for (w in config.words) {
        if (loadWord(config.words[w])) {
          wordsLeft++;
        }
      }
      // Render Grid
      grid.render();
      // Track clicks on the word list
      dom.words.find('li').on('click touchend', function(e){
        revealWord(this);
      });
      // finally start timer
      user.score = 0;
      user.time = 0;
      user.timeStart = + new Date();
      heartbeat = window.setInterval(updateHeader, 500);
      updateHeader();
    }

    // Initialization of WordFinder
    if (instanceConfig && typeof instanceConfig == 'object') {
      config = $.extend(true, config, instanceConfig);
    }

    // Set Dom pointers
    dom.wf = $(element);
    dom.wf.addClass('wordfind');
    // Build needed elements and then add DOM pointers
    dom.wf.html('<div class="header"/><div class="gridboard"/><div class="words"/><div class="dialog"/>');
    dom.grid = dom.wf.find('.gridboard');
    dom.grid.html('<canvas class="board"></canvas><canvas class="control"></canvas>')
    dom.canvas = {
      board : dom.grid.find('.board'),
      control : dom.grid.find('.control')
    };
    dom.words = dom.wf.find('.words');

    // Header elements
    dom.header = dom.wf.find('.header');
    dom.header.html('<span class="time"/><span class="points"/><span class="message"/>');
    dom.header.time = dom.header.find('span.time');
    dom.header.points = dom.header.find('span.points');
    dom.header.message = dom.header.find('span.message');
    dom.dialog = dom.wf.find('div.dialog');
    dom.dialog.hide();
    grid = new LF.activities.wordfind.GridBoard(dom.canvas.board, dom.canvas.control, config.width, config.height);

    // Apply Event handlers to DOM
    // Track mouseclicks on board
    dom.canvas.control.on('mousedown mouseup touchstart touchend', function(event) {
      event.preventDefault();
      mouseTrack(event);
    });

    dom.dialog.html('<p>Score by finding words from the list on the right in the grid below. Words can run in any direction.</p><button class="btn-large">Start New Game</button>');
    dom.dialog.show();
    dom.dialog.find('button').on('click', function(e){
      startNewGame();
    });

    return {
      /**
       * Exposes startNewGame
       */
      startNewGame: function(words) {
        startNewGame(words);
      }

    }

  },

  /**
   * GridBoard object that handles creation of the grid and placement of lines on the grid.
   * @param {object}  board     DOM pointer to canvas for the board grid
   * @param {object}  control   DOM pointer to canvas for the control grid
   * @param {integer} width     Width in squares for the grid
   * @param {integer} height    Height in squares for the grid
   * @namespace
   */
  GridBoard: function(board, control, width, height){

    var self = this,
      gridRows = [],
      cellSize = 35, // pixel height and width of cells
      hCellSize = cellSize / 2, // half cellSize
      tryCap = 500,
      pWidth = cellSize * width,
      pHeight = cellSize * height,
      lines = [],
      canvas = {};

    // Ensure ID is on page
    if (!board.length || !control.length) {
      throw new Exception('Board and Control must be defined DOM elements');
    }

    // Get canvas contexts
    canvas =  {
      board: board[0].getContext("2d"),
      control: control[0].getContext("2d")
    };

    /**
     * Clear contents of grid
     */
    function resetGrid() {
      var h, w, c;
      LF.log('reseting grid');
      // load grid rows with blanks
      for (h = 0; h < height; h++) {
        gridRows[h] = [];
        for (w = 0; w < width; w++) {
          gridRows[h][w] = '';
        }
      }
      // reset of canvas
      board.attr({'height': pHeight, 'width': pWidth});
      control.attr({'height': pHeight, 'width': pWidth});
    }

    /**
     * What to put in blank spaces on the board
     */
    function getBlank() {
      return String.fromCharCode(LF.getRand(65, 90));
    }

    /**
     * line object
     * @param {integer} x         x coordinate of line (0+)
     * @param {integer} y         y coordinate of line (0+)
     * @param {integer} direction Direction ID of line (0-7)
     * @param {integer} length    Length of line
     */
    function Line (y, x, direction, length) {
      y = y || 0;
      x = x || 0;
      d = direction || 0;
      var x2 = 0, y2 = 0, dx = 0, dy = 0;
      // figure out dy and dx
      switch (d) {
        case 0: dx = 0; dy = 1; break;
        case 1: dx = 1; dy = 1; break;
        case 2: dx = 1; dy = 0; break;
        case 3: dx = 1; dy = -1; break;
        case 4: dx = 0; dy = -1; break;
        case 5: dx = -1; dy = -1; break;
        case 6: dx = -1; dy = 0; break;
        case 7: dx = -1; dy = 1; break;
        default: throw new Exception ('Direction must be between 0 and 7.');
      }
      // figureout x2 and y2
      x2 = x + (dx * (length-1));
      y2 = y + (dy * (length-1));

      return { x: x, y: y, x2: x2, y2: y2, d: d, dx: dx, dy: dy, length: length };
    }

    /**
     * Initalization of grid
     */
    resetGrid();

    // public
    return {

      /**
       * Given a word, find a place for it to live on the board
       * @param {string} word     Word to place on board
       * @return {array} Coordinates of word (x, y, d)
       */
      loadWord: function(word) {
        var line, x, y, c, collision, overlap, needOverlap, letter, fits = false, loop = 0;

        // length check
        if (word.length >= width || word.length >= height) {
          return false; // word is too long
        }

        // loop until this word finds a home
        while (!fits) {
          line = new Line( LF.getRand(height-1), LF.getRand(width-1), LF.getRand(7), word.length );
          loop++;

          // just putting brakes on this train
          if (loop > tryCap) {
            // LF.log('BREAKING - too many tries');
            return false;
          }

          // check to see if we have a fit
          if (line.y2 >= height || line.y2 < 0 || line.x2 >= width || line.x2 < 0) {
            continue;
          }

          x = line.x;
          y = line.y;
          overlap = false;
          collision = false;
          needOverlap = LF.getRand(5) < 4 ? true : false;
          // First loop through and detect collisions
          for (c = 0; c < word.length; c++) {
            if (gridRows[y][x] != '' && gridRows[y][x] != word.substring(c, c+1)) {
              collision = true;
            }
            if (gridRows[y][x] == word.substring(c, c+1)) {
              overlap = true;
            }
            x += line.dx;
            y += line.dy;
          }
          if (collision || (needOverlap && !overlap)) {
            continue;
          }
          // Now we've confirmed all is well, add the letters
          x = line.x;
          y = line.y;
          for (c = 0; c < word.length; c++) {
            gridRows[y][x] = word.substring(c, c+1);
            x += line.dx;
            y += line.dy;
          }
          fits = true;

        }
        return line;
      },

      /**
       * Render the existing board
       */
      render: function() {
        var self = this,
          h = 0, w = 0,
          letter, html = '',
          ph, pw;

        canvas.board.font = "bold 24px sans-serif";
        canvas.board.textAlign = "center";
        canvas.board.textBaseline = "middle";
        // Render canvas
        for (h = 0; h < height; h++) {
          ph = (height - h) * cellSize - (cellSize / 2);
          for (w = 0; w < width; w++) {
            pw = w * cellSize + (cellSize / 2);
            letter = (gridRows[h][w] || getBlank()).toUpperCase();
            canvas.board.fillText(letter, pw, ph);
          }
        }
      },

      /**
       * Highlight a line on the control grid
       * @param {object} line       Line coordinates object
       * @param {string} className  Class to add to given line coordinates
       */
      highlightLine: function(line) {
        var self = this;
        self.clearControl();
        canvas.control.beginPath();
        canvas.control.moveTo(self.getCX(line.x), self.getCY(line.y));
        canvas.control.lineTo(self.getCX(line.x2), self.getCY(line.y2));
        canvas.control.lineWidth = cellSize;
        canvas.control.strokeStyle = "rgba(240,240,120,.4)";
        canvas.control.lineCap = 'round';
        canvas.control.stroke();
      },

      /**
       * Highlight a line on the board - used for solved words
       * @param {object} line       Line coordinates object
       * @param {string} className  Class to add to given line coordinates
       */
      highlightBoard: function(line) {
        var self = this;
        canvas.board.beginPath();
        canvas.board.moveTo(self.getCX(line.x), self.getCY(line.y));
        canvas.board.lineTo(self.getCX(line.x2), self.getCY(line.y2));
        canvas.board.lineWidth = cellSize;
        canvas.board.strokeStyle = "rgba(255,100,100,.4)";
        canvas.board.lineCap = 'round';
        canvas.board.stroke();
      },

      /**
       * Clears the board before rendering something
       */
      clearControl: function() {
        control.attr({'height': pHeight});
      },

      /**
       * Given coords, get line
       * @param {integer} y         y coordinate of line (0+)
       * @param {integer} x         x coordinate of line (0+)
       * @param {integer} y2        y2 coordinate of line (0+)
       * @param {integer} x2        x2 coordinate of line (0+)
       * @return {object} Line object instance
       */
      getLine: function(y, x, y2, x2) {
        var self = this,
          line,
          dy = y2-y,
          dx = x2-x,
          d = 0,
          c = 0,
          length = Math.max( Math.abs(dy), Math.abs(dx) ) + 1;

        // I'd add line check but skipping now to save cycles
        if (dy > 0) {
          if (dx == 0) { d = 0; }
          if (dx > 0) { d = 1; }
          if (dx < 0) { d = 7; }
        } else if (dy < 0) {
          if (dx == 0) { d = 4; }
          if (dx > 0) { d = 3; }
          if (dx < 0) { d = 5; }
        } else {
          if (dx > 0) { d = 2; }
          if (dx < 0) { d = 6; }
        }
        return new Line(y, x, d, length);
      },

      /**
       * Given a canvax X coord, return grid X
       */
      getX: function(cx) {
        if (cx <= 0) { return 0; }
        if (cx >= pWidth) { return width-1; }
        return Math.floor(cx / cellSize);
      },

      /**
       * Given a canvax Y coord, return grid Y
       */
      getY: function(cy) {
        cy = pHeight - cy;
        if (cy <= 0) { return 0; }
        if (cy >= pHeight) { return height-1; }
        return Math.floor(cy / cellSize);
      },

      /**
       * Given a grid X, return canvas X
       */
      getCX: function(gx) {
        if (gx <= 0) { return hCellSize; }
        if (gx >= width) { return pWidth - hCellSize; }
        return (gx * cellSize) + hCellSize;
      },

      /**
       * Given a grid Y, return canvas Y
       */
      getCY: function(cy) {
        cy = height - cy;
        if (cy <= 0) { return hCellSize; }
        if (cy >= height) { return pHeight - hCellSize; }
        return (cy * cellSize) - hCellSize;
      },

      /**
       * Given coordinates, determine if they form a line - either diagonal, vertical or horizontal
       */
      isLine: function(y, x, y2, x2) {
        if (y == y2 || x == x2 || Math.abs(x - x2) == Math.abs(y - y2)) {
          return true;
        }
        return false;
      },

      /**
       * Proxy to resetGrid
       */
      reset: function(){
        resetGrid();
      }
    };

  },

  init: function( element ) {
  	var stage = $('#activity-stage');
  	var wordfind = stage.html('<div id="wordfind"/>').find('#wordfind');
    this.instance = new this.Game(wordfind);
  }

};

