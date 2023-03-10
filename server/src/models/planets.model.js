const { parse } = require("csv-parse");
const fs = require("fs");
const path = require("path");
const planets = require("./planets.mongo");

const isHabitablePlanet = (planet) => {
    const { koi_disposition, koi_insol, koi_prad } = planet;
    return koi_disposition === "CONFIRMED" && koi_insol > 0.36 && koi_insol < 1.11 && koi_prad < 1.6;
};

async function loadPlanetsData() {
    return new Promise((resolve, reject) => {
        fs.createReadStream(path.join(__dirname, "..", "..", "data/kepler_data.csv"))
            .pipe(
                parse({
                    comment: "#",
                    columns: true,
                })
            )
            .on("data", async (data) => {
                if (isHabitablePlanet(data)) {
                    console.log('>>>> ', data);
                    await savePlanet(data);
                }
            })
            .on("error", (error) => {
                console.log(error);
                reject(error);
            })
            .on("end", async () => {
                const countPlanetsFound = (await getAllPlanets()).length;
                console.log(`We have found ${countPlanetsFound} habitable planets.`);
                resolve();
            });
    });
}

async function getAllPlanets() {
    return await planets.find({}, {
        '_id': 0,
        '__v': 0
    });
}

async function savePlanet(planet) {
    try {
        await planets.updateOne(
            {
                keplerName: planet.keplerName,
            },
            {
                keplerName: planet.keplerName,
            },
            {
                upsert: true,
            }
        );
    } catch(err) {
        console.log(`Could not save the planet ${err}`);
    }
}

module.exports = {
    getAllPlanets,
    loadPlanetsData,
};
