import { Game } from './Game';

const game = new Game();
(window as Window & { __arena?: Game }).__arena = game;
void game.init();
