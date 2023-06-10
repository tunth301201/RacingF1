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

`git clone https://github.com/tunth301201/RacingF1.git`

2. Install the dependencies:

`cd RacingF1`
`yarn install`

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

To fulfill this requirement, we have used `cheerio` to scrape the HTML data from the race results page. After extracting the data, I will store it in MongoDB (in this case, I am using `MongoDB Atlas`). 
```diff
- Please input your MongoDB Atlas URL when running the project (in db.ts file)
```
, or refer to the **illustration** below to understand the process of my API's GET request.

The `db.ts` and `raceResults.ts` files are created to connect to the database and define the race result data model.

In the `/race-results` code snippet, I use `Promise.all` to perform `multiple parallel requests`. Since the amount of data collected from 1950 to 2023 is quite large (around 24 000 objects), using `Promise.all` helps improve data retrieval efficiency. Each request is wrapped in a promise, and all promises are stored in an array called `racePromises`. By waiting for `Promise.all(racePromises)`, the code ensures that all requests have completed before returning the race results. The crawled data is then saved to the database according to the defined model.

- **Searching by year, driver, team, or race**
To make it user-friendly and intuitive, I have created three separate APIs for each type of search: `year-races`, `year-drivers`, and `year-teams`.

    - `year-races`: The search result returns races for the specified year, sorted in ascending order of the race date. The information includes the `grand prix`, `date`, `winner`, `car`, `laps`, and `time`.
    - `year-drivers`: The search result returns drivers for the specified year, sorted in descending order of points (calculated as the total points earned by the driver in all races of the specified year). The returned data includes the driver `name`, `car`, and corresponding `points`.
    - `year-teams`: The search result returns teams for the specified year, sorted in descending order of points (calculated as the total points earned by the team's drivers in the races of the specified year). The returned data includes the `team name` and corresponding `points`.

- **Searching with multiple conditions**
I have created three separate APIs to search for data based on multiple conditions: `year-specific race name`, `year-specific driver name`, and `year-specific team name`.

    - `year-specific race name`: This API returns all race results corresponding to the specified `year` and `race name`. The data is sorted in descending order of points. The returned data consists of `race result objects` stored in the database.
    - `year-specific race driver`: This API finds all race results corresponding to the specified `year` and `driver name`. The data is then sorted in ascending order of the race date. The returned data includes the `grand prix`, `date`, `car`, `position`, and `points`.
    - `year-specific race team`: This API finds all race results corresponding to the specified `year` and `team name`. The results are grouped by `race name`, and the total points of the team in each race are calculated. The returned data includes the `grand prix`, `date`, and `points` of the team in each race (sorted in ascending order of the race date).

## Illustration
Here are the API test illustrations use Thunder Client of Visual Studio (similar to Postman):

1. **API Retrieve Formula 1 race results from the formula1.com website and store them in a database**
    ![image](https://github.com/tunth301201/RacingF1/assets/92015206/171ca173-6c92-4e64-b8d7-723098302cee)
    
    - _Notification of successful data saving_
    
    ![image](https://github.com/tunth301201/RacingF1/assets/92015206/3c2bc33f-db32-456e-977d-59957aa49205)
    
    - _All data saved into mongo db_

    ![image](https://github.com/tunth301201/RacingF1/assets/92015206/69808f4e-e517-4bb1-9257-578c3be16cf3)

2. **API Search races by passed year**
    ![image](https://github.com/tunth301201/RacingF1/assets/92015206/3b871f71-b71c-45e0-a899-c96421ddb2fe)
    
    - _The returned result contains the races of the passed year (2022) and sorted in ascending order of date_
    
    ![image](https://github.com/tunth301201/RacingF1/assets/92015206/5008e4af-d0ce-427e-896f-aa51818ab3f4)

3. **API Search drivers by passed year**
    ![image](https://github.com/tunth301201/RacingF1/assets/92015206/5817ee7d-b55d-4411-871e-00fa0448840b)

    - _The returned result contains the drives of the passed year (2023) and sorted in descending order of point_

    ![image](https://github.com/tunth301201/RacingF1/assets/92015206/f409bbed-4f3a-4983-b019-e3cf8eb17656)

4. **API Search teams by passed year**
    ![image](https://github.com/tunth301201/RacingF1/assets/92015206/6f748288-0c0d-4b47-bbc1-f8bbf4f31beb)

    - _The returned result contains the teams of the passed year (2023) and sorted in descending order of point_

    ![image](https://github.com/tunth301201/RacingF1/assets/92015206/35028b84-0a62-4a46-ad79-c65c3262d08e)

5. **API Search specific race**
    ![image](https://github.com/tunth301201/RacingF1/assets/92015206/b9b31790-7c9b-4fe0-a632-bbd0461a9a7e)

    _The return result contains all race results corresponding to the specified year (2023) and race name (bahrain). The data is sorted in descending order of points_
    
    ![image](https://github.com/tunth301201/RacingF1/assets/92015206/b7f3f0d2-52ee-4eb2-b61b-b8270ebe78ae)

6. **API Search specific driver**
    ![image](https://github.com/tunth301201/RacingF1/assets/92015206/b988225e-7942-43e5-b1ae-35bc09f5241c)

    - _The return result contains all race results corresponding to the specified year (2023) and driver name (Alexander Albon). The data is then sorted in ascending order of the race date.
    
    ![image](https://github.com/tunth301201/RacingF1/assets/92015206/9a8340da-af8b-40ae-b64a-dee51b1759db)

7. **API Search specific team**
    ![image](https://github.com/tunth301201/RacingF1/assets/92015206/ee403782-38d0-4f4b-874e-c6cdc88605d7)

    - _The return result contains all race results corresponding to the specified year (2023) and team name (Alfa Romeo Ferrari). The results are grouped by race name, and the total points of the team in each race are calculated.
    
    ![image](https://github.com/tunth301201/RacingF1/assets/92015206/752bf541-7673-43b5-8807-3f5ecca035d1)
