const express = require("express");
const app = express();
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");
app.use(express.json());

const dbPath = path.join(__dirname, "cricketTeam.db");

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server is running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();
//API to GET all players

app.get("/players/", async (request, response) => {
  const getAllPlayersQuery = `SELECT 
    * FROM cricket_team ORDER BY
    player_id;`;
  const playersArray = await db.all(getAllPlayersQuery);
  response.send(playersArray);
});

//API to Creates a new player in the team (database)
//player_id is auto-incremented
//app.use(express.json());

app.post("/players/", async (request, response) => {
  const playerDetails = request.body;
  const { playerName, jerseyNumber, role } = playerDetails;
  const addPlayerQuery = `
    INSERT INTO cricket_team (player_name,jersey_number,role) 
    VALUES(
        '${playerName}',
        ${jerseyNumber},
        '${role}'
    );`;
  const dbResponse = await db.run(addPlayerQuery);
  const playerId = dbResponse.lastID;
  response.send("Player Added to Team");
});

//API to get a particular player based on playerId

app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const getPlayerQuery = `
    SELECT * FROM cricket_team WHERE player_id=${playerId};`;
  const player = await db.get(getPlayerQuery);
  response.send(player);
});
//API UPDATE..Updates the details of a player in the team (database) based on the player ID

app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const playerDetails = request.body;
  const { playerName, jerseyNumber, role } = playerDetails;

  const updatePlayerDetail = `
        UPDATE cricket_team 
        SET 
        player_name='${playerName}',
        jersey_number=${jerseyNumber},
        role='${role}'
        where player_id=${playerId};`;
  await db.run(updatePlayerDetail);
  response.send("Player Details Updated");
});

//API DELETE Deletes a player from the team (database) based on the player ID

app.delete("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const deletePlayerQuery = `
   DELETE FROM
   cricket_team
   WHERE player_id=${playerId};`;
  await db.run(deletePlayerQuery);
  response.send("Player Removed");
});

module.exports = app;
