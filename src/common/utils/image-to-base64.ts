import * as https from 'https';
import * as http from 'http';
import { URL } from "url";

export function imageUrlToBase64(imageUrl: string, mimeType?: string): Promise<string> {

    return new Promise((resolve, reject) => {
        const urlObj = new URL(imageUrl);
        const lib = urlObj.protocol === 'https:' ? https : http;

        lib.get(imageUrl, (res) => {
            if (res.statusCode !== 200) {
                reject(new Error(`Status code: ${res.statusCode}`));
                return;
            }

            const data: Buffer[] = [];
            res.on('data', (chunk) => data.push(chunk));
            res.on('end', () => {
                const buffer = Buffer.concat(data);
                let detectMime = mimeType;
                if (!detectMime) {
                    const contentType = res.headers['content-type'];
                    detectMime = contentType && contentType.startsWith('image/') ? contentType : 'image/jpeg';
                }

                resolve(`data:${detectMime};base64,${buffer.toString('base64')}`);
            });
        }).on('error', reject);
    });
}