import * as path from 'path';
import * as fs from 'fs';
import { Country } from '../types/country';

// Servicio dedicado para países como sugiere el documento de arquitectura
class CountriesService {
  private cache: Country[] | null = null;
  private cacheTimestamp: number = 0;
  private readonly CACHE_DURATION = 60 * 60 * 1000; // 1 hora
  private readonly dataPath: string;

  constructor() {
    this.dataPath = path.join(__dirname, '../data/countriesMock.json');
  }

  async getCountries(): Promise<Country[]> {
    try {
      return this.getCachedCountries();
    } catch (error) {
      console.error('Error loading countries:', error);
      throw new Error('Failed to load countries');
    }
  }

  async getCountriesByRegion(region?: string): Promise<Country[]> {
    const allCountries = await this.getCountries();
    
    if (!region) return allCountries;

    // Filtrar por región según el documento de arquitectura
    const regionMap: Record<string, string[]> = {
      'LATAM': ['AR', 'BR', 'MX', 'CO', 'CL', 'PE', 'UY'],
      'EUROPE': ['ES', 'IT', 'FR', 'DE'],
      'NORTH_AMERICA': ['US', 'CA']
    };

    const regionCodes = regionMap[region.toUpperCase()] || [];
    return allCountries.filter(country => regionCodes.includes(country.code));
  }

  private getCachedCountries(): Country[] {
    const now = Date.now();
    
    // Si hay cache y no ha expirado, devolver cache
    if (this.cache && (now - this.cacheTimestamp) < this.CACHE_DURATION) {
      return this.cache;
    }
    
    // Cargar desde archivo y actualizar cache
    const loadedCountries: Country[] = JSON.parse(fs.readFileSync(this.dataPath, 'utf8'));
    this.cache = loadedCountries;
    this.cacheTimestamp = now;
    
    return loadedCountries;
  }

  // Método para invalidar cache si es necesario
  invalidateCache(): void {
    this.cache = null;
    this.cacheTimestamp = 0;
  }
}

// Singleton instance
export const countriesService = new CountriesService(); 