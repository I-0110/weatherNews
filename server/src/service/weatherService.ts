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
    public icon: string,
    public tempF: number,
    public iconDescription: string,
    public windSpeed: number,
    public humidity: number,
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
    // console.log('Fetching location data from URL:', url);
    if (!response.ok) throw new Error('Location not found');
    
    const data = await response.json();
    if (!data.length) throw new Error('Location data not found');

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
    return `${this.baseURL}/data/2.5/forecast?lat=${coordinates.lat}&lon=${coordinates.lon}&units=metric&appid=${this.apiKey}`;
  }
  // TODO: Create fetchAndDestructureLocationData method
  private async fetchAndDestructureLocationData() {
    const rawLocation = await this.fetchLocationData(this.city);
    return this.destructureLocationData(rawLocation);
  }
  // TODO: Create fetchWeatherData method
  private async fetchWeatherData(coordinates: Coordinates) {
    const url = this.buildWeatherQuery(coordinates);
    // console.log('Fetching weather data from URL:', url);
    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch weather data');

    const data = await response.json();
    // console.log('Location data:', data);
    // console.log('Weather data:', data);
    return data.list;
  }

  // TODO: Build parseCurrentWeather method
  private parseCurrentWeather(response: any) {
    // console.log('Parsing current weather response:', response);
    return new Weather(
      response.name,
      response.weather.icon,
      response.main.temp,
      response.weather.description,
      response.wind.speed,
      response.main.humidity,
      new Date(response.dt * 1000).toString(),
    );
  }
  // TODO: Complete buildForecastArray method
  private buildForecastArray(currentWeather: Weather, weatherData: any[]): Weather[] {
    let forecastObjects: Weather[] = []
    let filtered = weatherData.filter((w)=> w.dt_txt.includes("12:00:00"))
    const uniqueDates = new Set<string>();

    for(let i = 0; i < filtered.length; i++){
      const date = filtered[i].dt_txt.split(' ')[0];

      if (uniqueDates.size < 5) {
        if (!uniqueDates.has(date)) {
          uniqueDates.add(date);
          forecastObjects.push(new Weather(
                    filtered[i].name, 
                    filtered[i].weather[0].icon,
                    filtered[i].main.temp,
                    filtered[i].weather[0].description,
                    filtered[i].wind.speed,
                    filtered[i].main.humidity,
                    new Date(filtered[i].dt_txt).toISOString()
            ));
        }
      } else {
        break;
      }
    }
    console.log('Filtered weather data:', filtered);
    return [currentWeather,...forecastObjects]
  }

  // TODO: Complete getWeatherForCity method
  async getWeatherForCity(city: string): Promise<Weather[]> {
    this.city = city;
    try {
        const coordinates = await this.fetchAndDestructureLocationData();
        const rawWeather = await this.fetchWeatherData(coordinates);
        if (!rawWeather.length) throw new Error('No weather data available')

        const currentWeather = this.parseCurrentWeather(rawWeather[0]);
        return this.buildForecastArray(currentWeather, rawWeather);
    } catch (error) {
        console.error('Error fetching weather data:', error);
        throw error;
    }
  }
}

export default new WeatherService();