import express, { Request, Response } from 'express';
import axios from 'axios';
import cheerio from 'cheerio';
import conn from './db';
import RaceResultSchema from './raceResult';


const app = express();
const PORT = 3000;


// Define API route to get the racing result F1 of all years (1950-2023)
app.get('/race-results', async (req: Request, res: Response) => {
    try {
        const startYear = 1950;
        const endYear = 2023;
        const resultsData: { raceName: string; year: number; date: string; driver: string; team: string; laps: number; time: string; point: number, pos: number; no: number }[] = [];
    
        // Create an array to hold all the promises
        const racePromises: Promise<void>[] = [];
    
        // Get all races
        for (let year = startYear; year <= endYear; year++) {
            const racePromise = axios.get(`https://www.formula1.com/en/results.html/${year}/races.html`)
            .then(async (response) => {
                const $ = cheerio.load(response.data);
                const raceResults = $('table.resultsarchive-table tbody tr');
    
                for (let i = 0; i < raceResults.length; i++) {
                    const element = raceResults[i];
                    const raceName = $(element).find('td:nth-child(2) a').text().trim();
                    const href = $(element).find('td:nth-child(2) a').attr('href');
                    const date = $(element).find('td:nth-child(3)').text().trim();
        
                    // Send GET request to the race result page for the specific race
                    const raceResponse = await axios.get(`https://www.formula1.com${href}`);
                    const race$ = cheerio.load(raceResponse.data);
                    const raceResultRows = race$('table.resultsarchive-table tbody tr');
        
                    raceResultRows.each((_, raceElement) => {
                        const driverElement = race$(raceElement).find('td:nth-child(4)');
                        const driver = driverElement.find('.hide-for-tablet').text().trim() + ' ' + driverElement.find('.hide-for-mobile').text().trim();
                        const team = race$(raceElement).find('td:nth-child(5)').text().trim();

                        const lapsText = race$(raceElement).find('td:nth-child(6)').text().trim();
                        const laps = isNaN(parseInt(lapsText)) ? 0 : parseInt(lapsText);

                        const time = race$(raceElement).find('td:nth-child(7)').text().trim();
                        const point = parseInt(race$(raceElement).find('td:nth-child(8)').text().trim());

                        const posText = race$(raceElement).find('td:nth-child(2)').text().trim();
                        const pos = isNaN(parseInt(posText)) ? 0 : parseInt(posText);

                        const no = parseInt(race$(raceElement).find('td:nth-child(3)').text().trim());
        
                        const raceResult = { raceName, year, date, driver, team, laps, time, point, pos, no };
                        resultsData.push(raceResult);
                    });
                };
            })
            .catch((error) => {
                console.error(`Error fetching race results for year ${year}:`, error);
            });
    
            racePromises.push(racePromise);
        }
    
        // Wait for all race promises to complete
        await Promise.all(racePromises);
    
        // Get the Mongoose model for RaceResult
        const RaceResult = RaceResultSchema.getModel();
    
        // Save race results to the database
        await RaceResult.insertMany(resultsData);
        console.log('Race results saved successfully');
    
        // Return the race results as JSON
        res.json(resultsData);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
  });
  

// Search races by passed year
app.get('/races/:year', async (req: Request, res: Response) => {
    try {
        const year = parseInt(req.params.year);

        // Get the Mongoose model for RaceResult
        const RaceResult = RaceResultSchema.getModel();

        // Search for races by year and position 1
        const races = await RaceResult.find({ year, pos: 1 });

        // Sort the races by date in ascending order
        races.sort((a, b) => {
            const dateA = new Date(a.date);
            const dateB = new Date(b.date);
            return dateA.getTime() - dateB.getTime();
        });

        // Extract the required information for each race
        const raceData = races.map((race) => ({
            grandPrix: race.raceName,
            date: race.date,
            winner: race.driver,
            car: race.team,
            laps: race.laps,
            time: race.time,
        }));

        // Return the race data
        res.json(raceData);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});


// Search drivers by passed year
app.get('/drivers/:year', async (req: Request, res: Response) => {
    try {
      const year = parseInt(req.params.year);
  
      // Get the Mongoose model for RaceResult
      const RaceResult = RaceResultSchema.getModel();
  
      // Search for races by year
      const races = await RaceResult.find({ year });
  
      // Create a map to store driver information
      const driverMap: { [driver: string]: { team: string; points: number } } = {};
  
      // Calculate the total points for each driver
      races.forEach((race) => {
        const driver = race.driver;
        const team = race.team;
        const points = race.point;
  
        if (!driverMap[driver]) {
          driverMap[driver] = { team, points };
        } else {
          driverMap[driver].points += points;
        }
      });
  
      // Extract the driver data
      const driverData = Object.entries(driverMap).map(([driver, data]) => ({
        driver,
        team: data.team,
        points: data.points,
      }));
  
      // Return the driver data
      res.json(driverData);
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });


// Search teams by passed year
app.get('/teams/:year', async (req: Request, res: Response) => {
    try {
      const year = parseInt(req.params.year);
  
      // Get the Mongoose model for RaceResult
      const RaceResult = RaceResultSchema.getModel();
  
      // Search for teams by year and calculate total points
      const teams = await RaceResult.aggregate([
        { $match: { year } },
        {
          $group: {
            _id: '$team',
            points: { $sum: '$point' },
          },
        },
        { $match: { points: { $gt: 0 } } },
      ]);
  
      // Extract the required information for each team
      const teamData = teams.map((team) => ({
        teamName: team._id,
        points: team.points,
      }));
  
      // Return the team data
      res.json(teamData);
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });


// Search specific race
app.get('/race-results/:year/:raceName', async (req: Request, res: Response) => {
    try {
      const year = parseInt(req.params.year);
      const raceName = req.params.raceName;
  
      // Get the Mongoose model for RaceResult
      const RaceResult = RaceResultSchema.getModel();
  
      // Find all race results matching the given year and race name
      const raceResults = await RaceResult.find({ year, raceName });
  
      // Return the race results as JSON
      res.json(raceResults);
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });


// Search specific driver
app.get('/driver-results/:year/:driverName', async (req: Request, res: Response) => {
    try {
      const year = parseInt(req.params.year);
      const driverName = req.params.driverName;
  
      // Get the Mongoose model for RaceResult
      const RaceResult = RaceResultSchema.getModel();
  
      // Find all race results matching the given year and driver name
      const driverResults = await RaceResult.find({ year, driver: driverName });
  
      // Extract the required data (raceName, team, pos, point) from the driver results
      const extractedData = driverResults.map((result) => ({
        grandPrix: result.raceName,
        date: result.year,
        car: result.team,
        pos: result.pos,
        point: result.point,
      }));
  
      // Return the extracted data as JSON
      res.json(extractedData);
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });


// Search specific team
app.get('/team-results/:year/:teamName', async (req: Request, res: Response) => {
    try {
      const year = parseInt(req.params.year);
      const teamName = req.params.teamName;
  
      // Get the Mongoose model for RaceResult
      const RaceResult = RaceResultSchema.getModel();
  
      // Find all race results matching the given year and team name
      const teamResults = await RaceResult.find({ year, team: teamName });
  
      // Group the team results by race name and calculate the total points for each race
      const raceResults: { grandPrix: string; date: number; point: number }[] = [];

      teamResults.forEach((result) => {
        const existingRaceResult = raceResults.find((r) => r.grandPrix === result.raceName);
        if (existingRaceResult) {
          existingRaceResult.point += result.point;
        } else {
          raceResults.push(
            { 
                grandPrix: result.raceName, 
                date: result.year, 
                point: result.point 
            });
        }
      });
  
      // Return the race results for the team as JSON
      res.json(raceResults);
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
  


// Connect db and start server
conn.once('open', () => {
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
      });
});