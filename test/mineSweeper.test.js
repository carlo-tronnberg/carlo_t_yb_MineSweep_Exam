const { MineSweeper } = require('../src/mineSweeper');

const GAME_RUNNING = 'running';
const GAME_OVER = 'Game Over';
const GAME_WIN = 'You Win';

describe("I want to play a game of Mine Sweeper where I'll win if I clear the board without stepping on a bomb", () => {
  describe('US1 Game Board Creation', () => {
    it.each([
      [1, 1, [[' ']]],
      [2, 1, [[' ', ' ']]],
      [1, 2, [[' '], [' ']]],
      [
        2,
        2,
        [
          [' ', ' '],
          [' ', ' '],
        ],
      ],
      [
        3,
        3,
        [
          [' ', ' ', ' '],
          [' ', ' ', ' '],
          [' ', ' ', ' '],
        ],
      ],
    ])(
      'Given a Game Board with width %i and height %i,    When starting the game,    Then I should get the empty Game Board %o',
      (width, height, gameBoard) => {
        const game = new MineSweeper(width, height);
        expect(game.getBoard()).toEqual(gameBoard);
      }
    );

    it.each([
      [3, 3, '+-+-+-+\n| | | |\n+-+-+-+\n| | | |\n+-+-+-+\n| | | |\n+-+-+-+'],
      [3, 2, '+-+-+-+\n| | | |\n+-+-+-+\n| | | |\n+-+-+-+'],
    ])(
      'Given a Game Board width 3 and height 3,    When starting the game,    Then I want to create the empty Game Board and get it back as a string %s',
      (width, height, gameBoardString) => {
        const game = new MineSweeper(width, height);
        expect(game.drawGameBoard()).toEqual(gameBoardString);
      }
    );

    it('Given a Game Board with width 3 and height 3,    When starting the game,    Then I want to create the hidden Bombs Board, matching the Game Board dimension', () => {
      let bombBoard = [
        [0, 0, 0],
        [1, 1, 0],
        [0, 1, 0],
      ];
      const game = new MineSweeper(3, 3);
      game.setBombs(bombBoard);
      expect(game.getBombs()).toEqual(bombBoard);
    });

    it('Given a Game Board with width 3 and height 3,    When trying to create a Bomb Board with a different dimension,    Then the bomb board will not be saved', () => {
      let bombBoard = [
        [0, 0, 0],
        [1, 1, 0],
      ];
      const game = new MineSweeper(3, 3);
      game.setBombs(bombBoard);
      expect(game.getBombs()).toEqual(null);
    });
  });

  describe('US2 Allow stepping into a square', () => {
    it('Given the Game Board,    When stepping on a square,    Then the game should know whether I am allowed to do so', () => {
      const game = new MineSweeper(3, 3);
      expect(game.allowOperation(0, 0)).toEqual(true);
      game.setSquareValue(0, 0, '_');
    });

    it('Given the Game Board,    When stepping on a square,    Then the game should track it and stop further attempts', () => {
      const game = new MineSweeper(3, 3);
      expect(game.allowOperation(0, 0)).toEqual(true);
      game.setSquareValue(0, 0, '_');
      expect(game.allowOperation(0, 0)).toEqual(false);
      game.setSquareValue(0, 0, '_');
      expect(game.allowOperation(1, 0)).toEqual(true);
    });
  });

  describe('US3 Game Over - Lose the game by stepping on a bomb', () => {
    it.each([
      [0, 0, GAME_RUNNING],
      [1, 1, GAME_OVER],
      [0, 1, GAME_OVER],
      [0, 2, GAME_RUNNING],
    ])(
      'Given the 3x3 Game Board,  When stepping on the square (%i,%i),  Then the game will be %s',
      (x, y, status) => {
        const game = new MineSweeper(3, 3);
        game.setBombs([
          [0, 0, 0], // ▲
          [1, 1, 0], // |
          [0, 1, 0], //  ——▶
        ]);
        expect(game.allowOperation(x, y)).toEqual(true);
        game.stepOnSquare(x, y);
        game.stepOnSquare(x, y);
        expect(game.allowOperation(x, y)).toEqual(false);
        expect(game.getStatus()).toEqual(status);
      }
    );
  });

  describe('US4 Get the number of neighbouring bombs when stepping on a clean square', () => {
    it.each([
      [0, 0, 3],
      [0, 3, 2],
      [2, 1, 4],
      [2, 3, 1],
      [3, 3, '_'],
    ])(
      'Given the Game Board,    When stepping on a square without a bomb (%i,%i) but having neighboring bomb(s),    Then I should get the count of %i neighboring bombs in the square',
      (x, y, count) => {
        const game = new MineSweeper(4, 4);
        game.setBombs([
          [0, 0, 0, 0],
          [1, 1, 0, 0],
          [1, 1, 0, 0],
          [0, 1, 0, 1],
        ]);
        game.stepOnSquare(x, y);
        expect(game.getSquareValue(x, y)).toBe(count);
      }
    );
  });

  describe('US5 Mark the bombs around', () => {
    it.each([
      [1, 0],
      [1, 1],
    ])(
      "Given the Game Board,      When identifying a potential bomb square (%1,%1),      Then I want to be able to mark it with a '*'",
      (x, y) => {
        const game = new MineSweeper(4, 4);
        game.setBombs([
          [0, 0, 0, 0],
          [1, 1, 0, 0],
          [1, 1, 0, 0],
          [0, 1, 0, 1],
        ]);
        game.markBomb(x, y);
        expect(game.getSquareValue(x, y)).toBe('*');
      }
    );

    it.each([
      [1, 1],
      [1, 2],
    ])(
      'Given the Game Board,      When changing my mind about a potential bomb square (%1,%1),      Then I want to be able to unmark a marked square',
      (x, y) => {
        const game = new MineSweeper(4, 4);
        game.setBombs([
          [0, 0, 0, 0],
          [1, 1, 0, 0],
          [1, 1, 0, 1],
          [0, 1, 0, 1],
        ]);
        game.markBomb(x, y);
        expect(game.getSquareValue(x, y)).toBe('*');
        game.unmarkBomb(x, y);
        expect(game.getSquareValue(x, y)).toBe(' ');
      }
    );
  });

  describe('US6 Game Victory', () => {
    it('Given the Game Board,    When stepping on the last bomb-free square,    Then I want to win the Game', () => {
      const game = new MineSweeper(3, 3);
      game.setBombs([
        [0, 0, 0],
        [1, 1, 0],
        [0, 1, 0],
      ]);
      game.stepOnSquare(0, 0);
      game.markBomb(2, 2);
      game.stepOnSquare(0, 2);
      game.stepOnSquare(1, 2);
      game.stepOnSquare(2, 0);
      game.stepOnSquare(2, 1);
      game.stepOnSquare(2, 2);
      expect(game.getStatus()).toEqual(GAME_WIN);
    });
  });

  describe('US7 Massive cleaning and victory', () => {
    it('Given the Game Board,     When stepping on a clear square with no neighboring bombs,    Then all neighboring squares with no bombs shall be cleared', () => {
      const game = new MineSweeper(3, 3);
      game.setBombs([
        [0, 0, 1],
        [0, 0, 0],
        [0, 0, 0],
      ]);
      game.stepOnSquare(0, 0);
      expect(game.getStatus()).toEqual(GAME_WIN);
    });
  });
});
