import { Router, type Request, type Response } from 'express';
const router = Router();

import HistoryService from '../../service/historyService.js';
import WeatherService from '../../service/weatherService.js';


// TODO: POST Request with city name to retrieve weather data
router.post('/', async (req: Request, res: Response) => {
  try {
    const { city } = req.body;

    if (!city) {
      return res.status(400).json({ error: 'City name is required' });
    }
  // TODO: GET weather data from city name
    const weatherData = await WeatherService.getWeatherForCity(city);
  // TODO: save city to search history
    await HistoryService.addCity(city);

    return res.status(200).json(weatherData);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Failed to fetch weather data'});
  }
});

// TODO: GET search history
router.get('/history', async (_req: Request, res: Response) => {
  try {
    const history = await HistoryService.getCities();
    res.status(200).json(history);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to get history'});
  }
});

// * BONUS TODO: DELETE city from search history
router.delete('/history/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await HistoryService.removeCity(id);

    if (!result) {
      return res.status(404).json({ error: 'City not found in history' });
    }

    return res.status(200).json({ message: 'City deleted from history' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Failed to delete city from history'});
  }
});

export default router;
