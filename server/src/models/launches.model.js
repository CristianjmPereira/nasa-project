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
            throw new Error("No matching planets found");
        }

        await launchesDatabase.findOneAndUpdate(
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

async function scheduleNewLaunch(launch) {
    const newFlightNumber = (await getLatestFlightNumber()) + 1;
    const newLaunch = Object.assign(launch, {
        flightNumber: newFlightNumber,
        customers: ["ZTM", "NASA"],
        upcoming: true,
        success: true,
    });

    await saveLaunch(newLaunch);
}

async function addNewLaunch(launch) {
    const latestFlightNumber = (await getLatestFlightNumber()) + 1;
    const insertedLaunch = {
        ...launch,
        flightNumber: latestFlightNumber,
        customers: ["ZTM", "NASA"],
        upcoming: true,
        success: true,
    };
    console.log("Creating new launch! ", insertedLaunch);
    await saveLaunch(insertedLaunch);

    return insertedLaunch;
}

async function getLatestFlightNumber() {
    const latestLaunch = await launchesDatabase.findOne().sort("-flightNumber");

    return latestLaunch?.flightNumber || DEFAULT_FLIGHT_NUMBER;
}

async function existsLaunchWithId(id) {
    return await launchesDatabase.findOne({ flightNumber: id });
}

async function abortLaunchWithId(id) {
    const aborted = await launchesDatabase.updateOne({ flightNumber: id }, { upcoming: false, success: false });

    return aborted.modifiedCount === 1;
}

module.exports = {
    getAllLaunches,
    addNewLaunch,
    existsLaunchWithId,
    abortLaunchWithId,
    scheduleNewLaunch,
};
