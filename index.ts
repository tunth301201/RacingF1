import express, { Request, Response } from 'express';
import axios from 'axios';
import cheerio from 'cheerio';
import conn from './db';
import RaceResultSchema from './raceResult';


const app = express();
const PORT = 3000;

// Connect db and start server
conn.once('open', () => {
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
      });
});