const API_URL = "http://localhost:8000";

async function httpGetPlanets() {
    const response = await fetch(`${API_URL}/planets`);
    return await response.json();
}

async function httpGetLaunches() {
    const response = await fetch(`${API_URL}/launches`);
    const fetchedLaunches = await response.json();
    return fetchedLaunches.sort((a, b) => a.flightNumber - b.flightNumber);
}

async function httpSubmitLaunch(launch) {
    try {
        const response = await fetch(`${API_URL}/launches`, {
            method: "post",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(launch),
        });
        return {
          ...response,
          ok: String(response.status).startsWith('2')
        }
    } catch (error) {
        return {
            ok: false,
        };
    }
}

async function httpAbortLaunch(id) {
    try {
        const response = await fetch(`${API_URL}/launches/${id}`, {
            method: "delete",
        });
        
        return {
          ...response,
          ok: String(response.status).startsWith('2')
        }
    } catch (error) {
        return {
            ok: false,
        };
    }
}

export { httpGetPlanets, httpGetLaunches, httpSubmitLaunch, httpAbortLaunch };
