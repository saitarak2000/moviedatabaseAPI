const express = require("express");
const app = express();

app.use(express.json());

const { open } = require("sqlite");

const sqlite3 = require("sqlite3");

const path = require("path");

const pathfind = (database) => {
  return path.join(__dirname, database);
};
let db = null;
const intializedbserver = async () => {
  try {
    db = await open({
      filename: pathfind("moviesData.db"),
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running on http://loclahost:3000");
    });
  } catch (e) {
    console.log(`error occurred ${e}`);
    process.exit(1);
  }
};
intializedbserver();

const convertcamelCase = (obj) => {
  return {
    movieName: obj.movie_name,
  };
};

app.get("/movies/", async (request, response) => {
  const query = `SELECT * FROM movie`;
  const data = await db.all(query);
  response.send(data.map((eachitem) => convertcamelCase(eachitem)));
});

app.post("/movies/", async (request, response) => {
  const moviedetails = request.body;
  const { movieName, directorId, leadActor } = moviedetails;
  const query = `INSERT INTO Movie (director_id,movie_name,lead_actor)
    VALUES( ${directorId},
            '${movieName}',
            '${leadActor}');`;
  await db.run(query);
  response.send("Movie Successfully Added");
});

const extractdetails = (obj) => {
  return {
    movieId: obj.movie_id,
    directorId: obj.director_id,
    movieName: obj.movie_name,
    leadActor: obj.lead_actor,
  };
};

app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const query = `select * from movie where movie_id=${movieId}`;
  const result = await db.get(query);
  response.send(extractdetails(result));
});

app.put("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const moviedetails = request.body;
  const { directorId, movieName, leadActor } = moviedetails;
  const query = `
    update 
    movie 
    set
        director_id = ${directorId},
        movie_name = '${movieName}',
        lead_actor = '${leadActor}'
        
        where movie_id = ${movieId};`;
  const data = await db.run(query);
  response.send("Movie Details Updated");
});

app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const query = `delete from movie where movie_id=${movieId};`;
  await db.run(query);
  response.send("Movie Removed");
});

const convertdirector = (obj) => {
  return {
    directorId: obj.director_id,
    directorName: obj.director_name,
  };
};

app.get("/directors/", async (request, response) => {
  const query = `select * from director`;
  const data = await db.all(query);
  response.send(data.map((eachitem) => convertdirector(eachitem)));
});

app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;

  const query = `select * from movie where director_id=${directorId}`;

  const data = await db.all(query);
  response.send(data.map((eachitem) => convertcamelCase(eachitem)));
});

module.exports = app;
