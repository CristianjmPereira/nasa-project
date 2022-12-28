const request = require("supertest");
const app = require("../../app");

describe("Test GET /launches", () => {
    test("Is should respond with 200 success", async () => {
        await request(app)
            .get("/launches")
            .expect(200)
            .expect("Content-Type", /json/);
    });
});

describe("Test POST /launches", () => {
    const launchDataWithoutDate = {
        mission: "USS Enterprise",
        rocket: "NCC 1701-D",
        target: "Kepler-186 f",
    };

    const completeLaunchData = {
        ...launchDataWithoutDate,
        launchDate: "December 12, 2030"
    }

    const launchDataWithInvalidDate = {
        ...completeLaunchData,
        launchDate: "Hello mate!"
    }

    test("It should respond with 200 success", async () => {
        const response = await request(app)
            .post('/launches')
            .send(completeLaunchData)
            .expect(201)
            .expect("Content-Type", /json/);

        const requestDate = new Date(completeLaunchData.launchDate).valueOf();
        const responseDate = new Date(response.body.launchDate).valueOf();

        expect(requestDate).toBe(responseDate);
        expect(response.body).toMatchObject(launchDataWithoutDate)
    });

    test("It should catch missing required properties", async () => {
        const response = await request(app)
        .post('/launches')
        .send(launchDataWithoutDate)
        .expect(400);

        expect(response.body).toStrictEqual({
            error: 'Missing required launch property'
        });
    });

    test("Is should catch invalid date", async () => {
        const response = await request(app)
        .post('/launches')
        .send(launchDataWithInvalidDate)
        .expect(400);

        expect(response.body).toStrictEqual({
            error: 'Invalid launch date'
        });
    });
});
