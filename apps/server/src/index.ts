import { ServerGameList, MPGameController } from "./MPGameController";
import { ItoMitaiGame } from "./ItoMitaiGame";
import { GameDatabaseAPI } from "./GameDatabaseAPI";
import { WebSocketServer } from "ws";
import express from "express";

const app = express();
const api = new GameDatabaseAPI();
const gameList = new ServerGameList();

const makeResponse = <T>({
  data,
  errors = [],
}: {
  data?: T;
  errors?: Array<Error>;
} = {}) => {
  return {
    success: !Boolean(errors.length),
    data,
    errors,
  };
};

app.get("/games/:id", (req, res) => {
  const serverGame = gameList.get(req.params.id);

  if (!serverGame) {
    const controller = new MPGameController({
      id: req.params.id,
      game: new ItoMitaiGame(),
      webSocketServer: new WebSocketServer({ noServer: true }),
      api,
    });

    gameList.add(controller);
  }

  res.send(makeResponse());
});

app.get("/games", (req, res) => {
  res.send(makeResponse({ data: gameList.games }));
});

const server = app.listen(3000, () => {
  console.log("listening on port 3000");
});

server.on("upgrade", (request, socket, head) => {
  if (!request.url) {
    socket.destroy();
    return;
  }

  const url = new URL(request.url, "ws://localhost:3000/");

  if (url.pathname.includes("/games/")) {
    const gameId = url.pathname.split("/").pop();

    if (!gameId) {
      socket.destroy();
      return;
    }

    const game = gameList.get(gameId);

    if (!game) {
      socket.destroy();
      return;
    }

    const { webSocketServer } = gameList.get(gameId);

    webSocketServer.handleUpgrade(request, socket, head, function done(ws) {
      webSocketServer.emit("connection", ws, request);
    });
  }
});
