const { parentPort, workerData } = require('worker_threads');
const { SlippiGame } = require("@slippi/slippi-js");
const fs = require('fs');
const path = require('path');

const { filePath, outputDir } = workerData;

try {
    const game = new SlippiGame(filePath);

    // Get game data
    const settings = game.getSettings();
    const metadata = game.getMetadata();
    const stats = game.getStats();

    const data = {
        settings: settings,
        metadata: metadata,
        stats: stats
    };

    // Output file path
    const outputFileName = path.basename(filePath, '.slp') + '.json';
    const outputPath = path.join(outputDir, outputFileName);

    // Save data to JSON file
    fs.writeFileSync(outputPath, JSON.stringify(data, null, 2));
    parentPort.postMessage('done');
} catch (error) {
    console.error(`Failed to process file: ${filePath}`, error);
    retryFile(filePath);
}

function retryFile(filePath) {
    try {
        const game = new SlippiGame(filePath);

        // Get game data
        const settings = game.getSettings();
        const metadata = game.getMetadata();
        const stats = game.getStats();
        // const frames = game.getFrames();


        const data = {
            settings: settings,
            metadata: metadata,
            stats: stats
            // frames: frames,
        };

        // Output file path
        const outputFileName = path.basename(filePath, '.slp') + '.json';
        const outputPath = path.join(outputDir, outputFileName);

        // Save data to JSON file
        fs.writeFileSync(outputPath, JSON.stringify(data, null, 2));
        parentPort.postMessage('done');
    } catch (error) {
        console.error(`Retry failed for file: ${filePath}`, error);
    }
}
