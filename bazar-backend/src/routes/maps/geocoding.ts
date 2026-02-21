import { Router } from 'express';
import { searchLocation, reverseGeocode } from '../../controllers/maps/geocoding.controller';

const router = Router();

router.get('/search', searchLocation);
router.get('/reverse', reverseGeocode);

export default router;
