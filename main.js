import puppeteer from 'puppeteer';
import axios from 'axios';
import fs from 'fs';
import path from 'path';

(async () => {
    const url = 'https://www.twitch.tv/aenot/clip/SavageDiligentNikudonFutureMan-wEL79wRRc4H3F0UH?filter=clips&range=7d&sort=time';
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    await page.goto(url, { waitUntil: 'networkidle2' });

    await page.waitForSelector('video');

    const videoSrc = await page.evaluate(() => {
        const videoElement = document.querySelector('video');
        return videoElement ? videoElement.src : null;
    });

    console.log('URL de la vidéo:', videoSrc);

    if (videoSrc) {
        const response = await axios({
            url: videoSrc,
            method: 'GET',
            responseType: 'stream'
        });

        const dir = path.resolve('data');
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir);
        }

        const filePath = path.resolve(dir, 'video.mp4');
        const writer = fs.createWriteStream(filePath);

        response.data.pipe(writer);

        writer.on('finish', () => {
            console.log('Téléchargement terminé. Vidéo sauvegardée dans:', filePath);
        });

        writer.on('error', (err) => {
            console.error('Erreur lors du téléchargement de la vidéo:', err);
        });
    } else {
        console.log('Impossible de trouver la balise vidéo sur la page.');
    }

    await browser.close();
})();
