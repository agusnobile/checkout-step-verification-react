import { Router } from 'express';
import { countriesService } from '../services/countriesService';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const region = req.query.region as string;
    const countries = await countriesService.getCountriesByRegion(region);
    
    // Headers de cache para el cliente (como sugiere el documento)
    res.setHeader('Cache-Control', 'public, max-age=3600'); // 1 hora
    res.json(countries);
  } catch (error) {
    console.error('Error loading countries:', error);
    res.status(500).json({ error: 'Error loading countries' });
  }
});

export default router;
