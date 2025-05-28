import { Router, type Request, type Response } from 'express';
const router = Router();

import HistoryService from '../../service/historyService.js';
import WeatherService from '../../service/weatherService.js';


// TODO: POST Request with city name to retrieve weather data
router.post('/', async (req: Request, res: Response) => {
  try {
    const { cityName } = req.body;

    if (!cityName) {
      return res.status(400).json({ error: 'City name is required' });
    }
  // TODO: GET weather data from city name
    const weatherData = await WeatherService.getWeatherForCity(cityName);
    console.log('weatherData from service:', weatherData);

    if (!weatherData || !Array.isArray(weatherData) || weatherData.length === 0) {
      return res.status(500).json({ error: 'Weather service returned null or undefined' });
    }
    if (!Array.isArray(weatherData) || weatherData.length === 0) {
      return res.status(500).json({ error: 'Weather service returned no data or invalid format' });
    }
  // TODO: save city to search history
    await HistoryService.addCity(cityName);

    return res.status(200).json(weatherData);
  } catch (error) {
    console.error('Error in POST /api/weather:', error);
    return res.status(500).json({ error: 'Failed to fetch weather data'});
  }
});

// TODO: GET search history
router.get('/history', async (_req: Request, res: Response) => {
  try {
    const history = await HistoryService.getCities();
    if (!history || !Array.isArray(history)) {
      console.error('Invalid history response:', history);
      return res.status(500).json({ error: 'Invalid history data' });
    }
    return res.status(200).json(history);
  } catch (error) {
    console.error('GET /history failed:', error);
    return res.status(500).json({ error: 'Failed to get history' });
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
