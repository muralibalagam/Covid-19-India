const express = require("express");
const path = require("path");
const sqlite3 = require("sqlite3");
const { open } = require("sqlite");
const app = express();
let database = null;
const dbPath = path.join(__dirname, "covid19India.db");
app.use(express.json());

const initializeDbAndServer = async () => {
  try {
    database = await open({ filename: dbPath, driver: sqlite3.Database });
    app.listen(3000, () => {
      console.log("Server is running on http://localhost:3000");
    });
  } catch (error) {
    console.log(`Data base error is ${error}`);
    process.exit(1);
  }
};
initializeDbAndServer();

// API 1
const ConvertStateDbAPI1 = (objectItem) => {
  return {
    stateId: objectItem.state_id,
    stateName: objectItem.state_name,
    population: objectItem.population,
  };
};

app.get("/states/", async (request, response) => {
  const getStateListQuery = `SELECT * FROM state;`;
  const getStateListQueryResponse = await database.all(getStateListQuery);
  response.send(
    getStateListQueryResponse.map((eachState) => ConvertStateDbAPI1(eachState))
  );
});

//API 2

const ConvertStateDbAPI2 = (objectItem) => {
  return {
    stateId: objectItem.state_id,
    stateName: objectItem.state_name,
    population: objectItem.population,
  };
};
app.get("/states/:stateId/", async (request, response) => {
  const { stateId } = request.params;
  const getStateDetailQuery = `SELECT * FROM state WHERE state_id = ${stateId};`;
  const getStateResponse = await database.get(getStateDetailQuery);
  response.send(ConvertStateDbAPI2(getStateResponse));
});

// API 3
app.post("/districts/", async (request, response) => {
  const { districtName, stateId, cases, cured, active, deaths } = request.body;
  const creatDistrictQuery = `INSERT INTO district(district_name,state_id,cases,cured,active,deaths)
    values('${districtName}',${stateId},${cases},${cured},${active},${deaths});`;
  const creatDistrictQueryResponse = await database.run(creatDistrictQuery);
  response.send("District Successfully Added");
});

// API 4
const ConvertMovieDbAPI4 = (objectItem) => {
  return {
    districtId: objectItem.district_id,
    districtName: objectItem.district_name,
    stateId: objectItem.state_id,
    cases: objectItem.cases,
    cured: objectItem.cured,
    active: objectItem.active,
    deaths: objectItem.deaths,
  };
};
app.get("/districts/:districtId/", async (request, response) => {
  const { districtId } = request.params;
  const getDistrictDetailQuery = `SELECT * FROM district WHERE district_id = ${districtId}`;
  const getDistrictDetailQueryResponse = await database.get(
    getDistrictDetailQuery
  );
  response.send(ConvertMovieDbAPI4(getDistrictDetailQueryResponse));
});

//API 5
app.delete("/districts/:districtId/", async (request, response) => {
  const { districtId } = request.params;
  const deleteDistrictQuery = `DELETE FROM district WHERE district_id = ${districtId};`;
  const deleteDistrictQueryResponse = await database.run(deleteDistrictQuery);
  response.send("District Removed");
});

//API 6
app.put("/districts/:districtId/", async (request, response) => {
  const { districtId } = request.params;
  const { districtName, stateId, cases, cured, active, deaths } = request.body;
  const updateDistrictQuery = `UPDATE district SET 
    district_name='${districtName}',
    state_id=${stateId},
    cases=${cases},
    cured=${cured},
    active=${active},
    deaths=${deaths} WHERE district_id = ${districtId};`;
  const updateDistrictQueryResponse = await database.run(updateDistrictQuery);
  response.send("District Details Updated");
});

//API 7
// const ConvertMovieDbAPI5 = (objectItem) => {
//   return {
//     cases: objectItem.cases,
//     cured: objectItem.cured,
//     active: objectItem.active,
//     deaths: objectItem.deaths,
//   };
// };

app.get("/states/:stateId/stats/", async (request, response) => {
  const { stateId } = request.params;
  const getStatesQuery = `
    SELECT
    SUM(cases) as totalCases,
    SUM(cured) as totalCured,
    SUM(active) as totalActive,
    SUM(deaths) as totalDeaths
    FROM
    district
    WHERE
    state_id = ${stateId};`;
  const getStateQueryResponse = await database.get(getStatesQuery);
  response.send(getStateQueryResponse);
});

//API 8

app.get("/districts/:districtId/details/", async (request, response) => {
  const { districtId } = request.params;
  const getDistrictIdQuery = `select state_id from district where district_id = ${districtId};`;
  const getDistrictIdQueryResponse = await database.get(getDistrictIdQuery);
  //console.log(typeof getDistrictIdQueryResponse.state_id);
  const getStateNameQuery = `select state_name as stateName from state where 
  state_id = ${getDistrictIdQueryResponse.state_id}`;
  const getStateNameQueryResponse = await database.get(getStateNameQuery);
  response.send(getStateNameQueryResponse);
});

module.exports = app;
