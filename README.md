# Formula 1 Racing Results API

This API allows you to retrieve Formula 1 racing results for different years and perform various searches based on race, driver, and team.

Requirements:
- Retrieve and save the content from the F1 racing result page into database.
- Write a REST API that allows searching for contents by year, driver, team, race, etc., using the results of the crawling.
- Design the API to allow searching using various conditions (like the yearly ranking of specific teams/drivers, etc.).

## Prerequisites

Before running the API, ensure that you have the following software installed on your machine:

- Node.js
- MongoDB

## Installation

1. Clone the repository:

`git clone https://github.com/your-username/your-repository.git`

2. Install the dependencies:

`cd your-repository`
`npm install`

3. Configure the database connection:

Open the `db.ts` file and update the MongoDB connection URL (MongoDB Atlas) with your own database credentials.

4. Start the API:

`npm start`

The API will start running on http://localhost:3000.

## API Endpoints

- **GET /race-results**

Returns the racing results for all Formula 1 races from 1950 to 2023 (get from https://www.formula1.com/)

- **GET /races/:year**

Returns the races held in the specified year and their winners.

- **GET /drivers/:year**

Returns the drivers and their respective points at races for the specified year.

- **GET /teams/:year**

Returns the teams and their respective points at races for the specified year.

- **GET /race-results/:year/:raceName**

Returns the results of a specific race in the specified year.

- **GET /driver-results/:year/:driverName**

Returns the results of a specific driver in the specified year.

- **GET /team-results/:year/:teamName**

Returns the results of a specific team in the specified year.

## Explanation

In this project, the first requirement is to **retrieve Formula 1 race results from the formula1.com website and store them in a database**.

To fulfill this requirement, we have used `cheerio` to scrape the HTML data from the race results page. After extracting the data, I will store it in MongoDB (in this case, I am using `MongoDB Atlas`). **_Please input your MongoDB Atlas URL when running the project_**, or refer to the illustration below to understand the process of my API's GET request.

The `db.ts` and `raceResults.ts` files are created to connect to the database and define the race result data model.

In the `/race-results` code snippet, I use `Promise.all` to perform `multiple parallel requests`. Since the amount of data collected from 1950 to 2023 is quite large (around 24 000 objects), using `Promise.all` helps improve data retrieval efficiency. Each request is wrapped in a promise, and all promises are stored in an array called `racePromises`. By waiting for `Promise.all(racePromises)`, the code ensures that all requests have completed before returning the race results. The crawled data is then saved to the database according to the defined model.

- **Searching by year, driver, team, or race**
To make it user-friendly and intuitive, I have created three separate APIs for each type of search: `year-races`, `year-drivers`, and `year-teams`.

    - `year-races`: The search result returns races for the specified year, sorted in descending order of the race date. The information includes the `grand prix`, `date`, `winner`, `car`, `laps`, and `time`.
    - `year-drivers`: The search result returns drivers for the specified year, sorted in descending order of points (calculated as the total points earned by the driver in all races of the specified year). The returned data includes the driver `name`, `car`, and corresponding `points`.
    - `year-teams`: The search result returns teams for the specified year, sorted in descending order of points (calculated as the total points earned by the team's drivers in the races of the specified year). The returned data includes the `team name` and corresponding `points`.

- **Searching with multiple conditions**
I have created three separate APIs to search for data based on multiple conditions: `year-specific race name`, `year-specific driver name`, and `year-specific team name`.

    - `year-specific race name`: This API returns all race results corresponding to the specified `year` and `race name`. The data is sorted in descending order of points. The returned data consists of `race result objects` stored in the database.
    - `year-specific race driver`: This API finds all race results corresponding to the specified `year` and `driver name`. The data is then sorted in ascending order of the race date. The returned data includes the `grand prix`, `date`, `car`, `position`, and `points`.
    - `year-specific race team`: This API finds all race results corresponding to the specified `year` and `team name`. The results are grouped by `race name`, and the total points of the team in each race are calculated. The returned data includes the `grand prix`, `date`, and `points` of the team in each race (sorted in ascending order of the race date).

## Usage



