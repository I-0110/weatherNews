import { promises as fs } from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

const historyFile = path.resolve('searchHistory.json');

// TODO: Define a City class with name and id properties
class City {
  constructor(
    public id: string,
    public name: string
  ) {}
}
// TODO: Complete the HistoryService class
class HistoryService {
  // TODO: Define a read method that reads from the searchHistory.json file
  private async read(): Promise<City[]> {
    try {
      const data = await fs.readFile(historyFile, 'utf-8');
      return JSON.parse(data) as City[];
    } catch (err) {
      return[];
    }
  }
  // TODO: Define a write method that writes the updated cities array to the searchHistory.json file
  private async write(cities: City[]): Promise<void> {
    await fs.writeFile(historyFile, JSON.stringify(cities, null, 2));
  }
  // TODO: Define a getCities method that reads the cities from the searchHistory.json file and returns them as an array of City objects
  async getCities(): Promise<City[]> {
    return this.read();
  }
  // TODO Define an addCity method that adds a city to the searchHistory.json file
  async addCity(cityName: string) {
    const cities = await this.read();

    if (cities.some(city => city.name.toLowerCase() === cityName.toLowerCase())) {
      throw new Error('City already in history');
    }

    const newCity = new City(uuidv4(), cityName);
    cities.push(newCity);
    await this.write(cities);
    return newCity;
  }
  // * BONUS TODO: Define a removeCity method that removes a city from the searchHistory.json file
  async removeCity(id: string) {
    const cities = await this.read();
    const index = cities.findIndex(city => city.id === id);
    if (index === -1) return false;

    cities.splice(index, 1);
    await this.write(cities);
    return true;
  }
}

export default new HistoryService();
