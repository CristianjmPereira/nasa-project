const { parse } = require("csv-parse");
const fs = require("fs");
const path = require("path");

const habitablePlanets = [];

const isHabitablePlanet = (planet) => {
    const { koi_disposition, koi_insol, koi_prad } = planet;
    return koi_disposition === "CONFIRMED" && koi_insol > 0.36 && koi_insol < 1.11 && koi_prad < 1.6;
};

async function loadPlanetsData() {
    return new Promise((resolve, reject) => {
        fs.createReadStream(path.join(__dirname, '..', '..', 'data/kepler_data.csv'))
            .pipe(parse({
                comment: "#",
                columns: true,
            }))
            .on("data", (data) => {
                if (isHabitablePlanet(data)) {
                    habitablePlanets.push(data);
                }
            })
            .on("error", (error) => {
                console.log(error);
                reject(error);
            })
            .on("end", () => {
                console.log(`We have found ${habitablePlanets.length} habitable planets.`)
                resolve();
            });
    });
}

module.exports = {
    planets: habitablePlanets,
    loadPlanetsData
};
