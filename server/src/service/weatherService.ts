import dotenv from 'dotenv';
dotenv.config();

import { v4 as uuidv4 } from 'uuid';

// TODO: Define an interface for the Coordinates object
interface Coordinates {
  id: string;
  lat: number;
  lon: number;
  name: string;
  country: string;
  state?: string;
}
// TODO: Define a class for the Weather object
class Weather {
  constructor(
    public city: string,
    public country: string,
    public temperature: number,
    public description: string,
    public date: string 
  ) {}
}
// TODO: Complete the WeatherService class
class WeatherService {
  // TODO: Define the baseURL, API key, and city name properties
  baseURL: string;
  apiKey: string;
  city: string;

  constructor() {
    this.baseURL = 'https://api.openweathermap.org';
    this.apiKey = process.env.OPENWEATHER_API_KEY || '';
    this.city = '';
  }
  // TODO: Create fetchLocationData method
  private async fetchLocationData(query: string) {
    const url = this.buildGeocodeQuery(query);
    const response = await fetch(url);
    if (!response.ok) throw new Error('Location not found');
    
    const data = await response.json();
    if (!data.length) throw new Error('Location not found');

    return data[0];
  }
  // TODO: Create destructureLocationData method
  private destructureLocationData(locationData: any): Coordinates {
    return {
      id: uuidv4(),
      lat: locationData.lat,
      lon: locationData.lon,
      name: locationData.name,
      country: locationData.country,
      state: locationData.state,
    };
  }
  // TODO: Create buildGeocodeQuery method
  private buildGeocodeQuery(query: string): string {
    return `${this.baseURL}/geo/1.0/direct?q=${encodeURIComponent(query)}&limit=1&appid=${this.apiKey}`;
  }
 
  // TODO: Create buildWeatherQuery method
  private buildWeatherQuery(coordinates: Coordinates): string {
    return `${this.baseURL}/data/2.5/weather?lat=${coordinates.lat}&lon=${coordinates.lon}&units=metric&appid=${this.apiKey}`;
  }
  // TODO: Create fetchAndDestructureLocationData method
  private async fetchAndDestructureLocationData() {
    const rawLocation = await this.fetchLocationData(this.city);
    return this.destructureLocationData(rawLocation);
  }
  // TODO: Create fetchWeatherData method
  private async fetchWeatherData(coordinates: Coordinates) {
    const url = this.buildWeatherQuery(coordinates);
    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch weather data');

    const data = await response.json();
    return data;
  }

  // TODO: Build parseCurrentWeather method
  private parseCurrentWeather(response: any) {
    return new Weather(
      response.name,
      response.sys.country,
      response.main.temp,
      response.weather[0].description,
      new Date(response.dt * 1000).toISOString()
    );
  }
  // TODO: Complete buildForecastArray method
  private buildForecastArray(currentWeather: Weather, _weatherData: any[]): Weather[] {
    return [currentWeather];
  }

  // TODO: Complete getWeatherForCity method
  async getWeatherForCity(city: string): Promise<Weather[]> {
    this.city = city;
    const coordinates = await this.fetchAndDestructureLocationData();
    const rawWeather = await this.fetchWeatherData(coordinates);
    const currentWeather = this.parseCurrentWeather(rawWeather);
    return this.buildForecastArray(currentWeather, rawWeather);
  }
}

export default new WeatherService();
