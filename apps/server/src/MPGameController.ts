import WebSocket, { WebSocketServer, RawData } from "ws";
import { ItoMitaiGame } from "./ItoMitaiGame";
import { GameDatabaseAPI } from "./GameDatabaseAPI";

export class ServerGameList {
  games: Record<string, MPGameController> = {};

  add = (controller: MPGameController) => {
    this.games[controller.id] = controller;
  };

  remove = (id: string) => {
    delete this.games[id];
  };

  get = (id: string) => {
    return this.games[id];
  };
}

type MessageType =
  | "START_ROUND"
  | "FINISH_ROUND"
  | "SUBMIT_GUESS"
  | "ADD_PLAYER"
  | "REMOVE_PLAYER"
  | "RESET_GAME";

type GameMessage<T = any> = {
  timestamp: number; // Date.now() sent from browser
  type: MessageType;
  data: T;
};

type SubmitGuessMessage = GameMessage<{
  playerId: string;
  guessPlayerIDsInOrder: Array<string>;
}>;

type AddPlayerMessage = GameMessage<{
  name: string;
}>;

type RemovePlayerMessage = GameMessage<{
  playerId: string;
}>;

export class MPGameController {
  webSocketServer: WebSocketServer;
  game: ItoMitaiGame;
  api: GameDatabaseAPI;
  id: string;

  constructor({
    id,
    game,
    webSocketServer,
    api,
  }: {
    id: string;
    game: ItoMitaiGame;
    webSocketServer: WebSocketServer;
    api: GameDatabaseAPI;
  }) {
    this.id = id;
    this.webSocketServer = webSocketServer;
    this.game = game;
    this.api = api;
    this.api.saveById(GameDatabaseAPI.toGameState(this.game));

    this.webSocketServer.on("connection", (ws) => {
      ws.send(JSON.stringify(this.getGameState()));

      ws.on("message", this.onMessage);
    });
  }

  private saveGameToDB = () => {
    this.api.saveById(GameDatabaseAPI.toGameState(this.game));

    console.log("--- updated game ---");
    console.log(this.game);
  };

  private broadcast = () => {
    this.webSocketServer.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(this.getGameState()));
      }
    });
  };

  onMessage = (raw: RawData) => {
    try {
      const data = JSON.parse(raw.toString());

      if (!data.timestamp || !data.type) {
        throw new Error("invalid browser message");
      }

      const message = data as GameMessage;

      const currentGameState = this.api.getById(this.game.id);

      // if the message is older, ignore it as stale
      if (message.timestamp <= currentGameState.lastUpdatedTime) {
        return;
      }

      if (message.type === "START_ROUND") {
        this.game.startRound();
      }

      if (message.type === "FINISH_ROUND") {
        this.game.finishRound();
      }

      if (message.type === "SUBMIT_GUESS") {
        const { playerId, guessPlayerIDsInOrder } = (
          message as SubmitGuessMessage
        ).data;

        this.game.submitGuess(playerId, guessPlayerIDsInOrder);
      }

      if (message.type === "ADD_PLAYER") {
        const { name } = (message as AddPlayerMessage).data;

        this.game.addPlayer(name);
      }

      if (message.type === "REMOVE_PLAYER") {
        const { playerId } = (message as RemovePlayerMessage).data;

        this.game.removePlayer(playerId);
      }

      if (message.type === "RESET_GAME") {
        this.game.reset();
      }

      this.saveGameToDB();
      this.broadcast();
    } catch (err) {
      console.error("could not parse websocket message");
      console.error(err);
    }
  };

  getGameState = () => {
    return this.api.getById(this.game.id);
  };
}
