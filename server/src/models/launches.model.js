const launchesDatabase = require("./launches.mongo");

const launches = new Map();

let latestFlightNumber = 100;

const launch = {
    flightNumber: 100,
    mission: "Kepler Exploration X",
    rocket: "Explorer IS1",
    launchDate: new Date("December 27, 2030"),
    target: "Kepler-442 b",
    customers: ["ZTM", "NASA"],
    upcoming: true,
    success: true,
};

launches.set(launch.flightNumber, launch);

function getAllLaunches() {
    return Array.from(launches.values());
}

async function saveLaunch(launch) {
    try {
        await launchesDatabase.updateOne(
            {
                flightNumber: launch.flightNumber,
            },
            launch,
            { upsert: true }
        );
    } catch(err) {
        console.log('Fail to save launch: ', err);
    }
}

function addNewLaunch(launch) {
    latestFlightNumber++;
    const insertedLaunch = {
        ...launch,
        flightNumber: latestFlightNumber,
        customers: ["ZTM", "NASA"],
        upcoming: true,
        success: true,
    };
    console.log('Creating new launch! ', insertedLaunch);
    saveLaunch(insertedLaunch);
    // launches.set(latestFlightNumber, insertedLaunch);
    return insertedLaunch;
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
