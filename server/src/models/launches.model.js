const launchesDatabase = require("./launches.mongo");
const planets = require("./planets.mongo");

const launches = new Map();

const DEFAULT_FLIGHT_NUMBER = 100;

async function getAllLaunches() {
    const dbLaunches = await launchesDatabase.find(
        {},
        {
            _is: 0,
            __v: 0,
        }
    );
    return dbLaunches;
}

async function saveLaunch(launch) {
    try {
        const planet = await planets.findOne({ keplerName: launch.target });

        if (!planet) {
            throw new Error('No matching planets found');
        }

        await launchesDatabase.updateOne(
            {
                flightNumber: launch.flightNumber,
            },
            launch,
            { upsert: true }
        );
    } catch (err) {
        console.log("Fail to save launch: ", err);
    }
}

async function addNewLaunch(launch) {
    const latestFlightNumber = await getLatestFlightNumber();
    const insertedLaunch = {
        ...launch,
        flightNumber: latestFlightNumber,
        customers: ["ZTM", "NASA"],
        upcoming: true,
        success: true,
    };
    console.log("Creating new launch! ", insertedLaunch);
    saveLaunch(insertedLaunch);

    return insertedLaunch;
}

async function getLatestFlightNumber() {
    const latestLaunch = await launchesDatabase.findOne().sort('-flightNumber');

    return latestLaunch?.flightNumber + 1 || DEFAULT_FLIGHT_NUMBER; 
}

function existsLaunchWithId(id) {
    return launches.has(id);
}

function abortLaunchWithId(id) {
    const aborted = launches.get(id);
    aborted.upcoming = false;
    aborted.success = false;

    return aborted;
}

module.exports = {
    getAllLaunches,
    addNewLaunch,
    existsLaunchWithId,
    abortLaunchWithId,
};
