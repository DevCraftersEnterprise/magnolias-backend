import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

export interface GeocodingResult {
    latitude: number;
    longitude: number;
}

@Injectable()
export class GeocodingService {
    private readonly logger = new Logger(GeocodingService.name);
    private readonly userAgent: string;
    private readonly baseUrl = 'https://nominatim.openstreetmap.org';
    private lastRequestTime = 0;
    private readonly minRequestInterval = 1000;

    constructor(private readonly configService: ConfigService) {
        this.userAgent = this.configService.get<string>('GEOCODING_USER_AGENT') || 'MagnoliasApp/1.0'
    }

    async geocodeAddress(address: string): Promise<GeocodingResult | null> {
        try {
            await this.respectRateLimit();

            const query = encodeURIComponent(`${address}, México`);
            const url = `${this.baseUrl}/search?format=json&q=${query}&limit=1&addressdetails=1`;

            this.logger.debug(`Geocoding address: ${address}`);

            const response = await fetch(url, {
                headers: {
                    'User-Agent': this.userAgent,
                    'Accept-Language': 'es-MX,es;q=0.9',
                }
            });

            if (!response.ok) {
                this.logger.warn(`Geocoding API returned status: ${response.status}`);
                return null;
            }

            const data = await response.json();

            if (data && data.length > 0) {
                const result = {
                    latitude: parseFloat(data[0].lat),
                    longitude: parseFloat(data[0].lon),
                };
                this.logger.log(
                    `Successfully geocoded address: ${address} -> (${result.latitude}, ${result.longitude})`,
                );
                return result;
            }

            this.logger.warn(`No result found for address: ${address}`);
            return null;
        } catch (error) {
            this.logger.error(`Error geocoding address: ${address}`, error.stack);
            return null;
        }
    }

    isValidCoordinates(lat: number, lon: number): boolean {
        return (lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180 && !isNaN(lat) && !isNaN(lon))
    }

    private async respectRateLimit(): Promise<void> {
        const now = Date.now();
        const timeSinceLastRequest = now - this.lastRequestTime;

        if (timeSinceLastRequest < this.minRequestInterval) {
            const waitTime = this.minRequestInterval - timeSinceLastRequest;
            await new Promise((resolve) => setTimeout(resolve, waitTime));
        }

        this.lastRequestTime = Date.now();
    }
}