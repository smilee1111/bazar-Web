import { Request, Response } from 'express';

export const searchLocation = async (req: Request, res: Response) => {
    try {
        const { q } = req.query;
        
        if (!q || typeof q !== 'string' || q.trim().length < 3) {
            return res.status(400).json({ message: 'Query must be at least 3 characters' });
        }

        const response = await fetch(
            `https://nominatim.openstreetmap.org/search?` +
            new URLSearchParams({
                q: q,
                format: 'json',
                limit: '5',
                addressdetails: '1',
            }),
            {
                headers: {
                    'User-Agent': 'BazarApp/1.0',
                },
            }
        );

        if (!response.ok) {
            throw new Error('Failed to fetch from Nominatim');
        }

        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error('Geocoding search error:', error);
        res.status(500).json({ message: 'Failed to search location' });
    }
};

export const reverseGeocode = async (req: Request, res: Response) => {
    try {
        const { lat, lng } = req.query;
        
        if (!lat || !lng) {
            return res.status(400).json({ message: 'Latitude and longitude required' });
        }

        const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?` +
            new URLSearchParams({
                lat: lat.toString(),
                lon: lng.toString(),
                format: 'json',
                addressdetails: '1',
            }),
            {
                headers: {
                    'User-Agent': 'BazarApp/1.0',
                },
            }
        );

        if (!response.ok) {
            throw new Error('Failed to reverse geocode');
        }

        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error('Reverse geocoding error:', error);
        res.status(500).json({ message: 'Failed to reverse geocode' });
    }
};
