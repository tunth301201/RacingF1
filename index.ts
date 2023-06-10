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
        const resultsData: { raceName: string; year: number; driver: string; team: string; laps: number; time: string; point: number, pos: number; no: number }[] = [];
    
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
        
                        const raceResult = { raceName, year, driver, team, laps, time, point, pos, no };
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
  


app.get('/races/:year', async (req: Request, res: Response) => {
try {
    const year = parseInt(req.params.year);

    // Get the Mongoose model for RaceResult
    const RaceResult = RaceResultSchema.getModel();

    // Search for races by year and position 1
    const races = await RaceResult.find({ year, pos: 1 });

    // Extract the required information for each race
    const raceData = races.map((race) => ({
    raceName: race.raceName,
    year: race.year,
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
  
  
  
  




// Connect db and start server
conn.once('open', () => {
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
      });
});