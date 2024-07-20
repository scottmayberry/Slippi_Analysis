const fs = require('fs');
const path = require('path');
const { Worker } = require('worker_threads');
const ProgressBar = require('progress');

// Get directories from command-line arguments or use default values
const slippiDir = process.argv[2] || "C:\\Users\\Scott\\Documents\\Slippi";
const outputDir = process.argv[3] || "./data";

// Create the output directory if it doesn't exist
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir);
}

// Function to recursively get all .slp files in a directory
function getAllSlpFiles(dir) {
    const files = fs.readdirSync(dir);
    let slpFiles = [];

    files.forEach(file => {
        const filePath = path.join(dir, file);

        if (fs.lstatSync(filePath).isDirectory()) {
            // Recursively process subdirectories
            slpFiles = slpFiles.concat(getAllSlpFiles(filePath));
        } else if (path.extname(file) === '.slp') {
            // Check if the corresponding JSON file already exists
            const jsonFileName = path.basename(file, '.slp') + '.json';
            const jsonFilePath = path.join(outputDir, jsonFileName);

            if (!fs.existsSync(jsonFilePath)) {
                slpFiles.push(filePath);
            }
        }
    });

    return slpFiles;
}

// Start processing the directory
const slpFiles = getAllSlpFiles(slippiDir);

// Initialize progress bar
const bar = new ProgressBar('Processing [:bar] :current/:total :percent :etas', {
    total: slpFiles.length,
    width: 40,
    complete: '=',
    incomplete: ' ',
    clear: true
});

let completed = 0;

// Function to update the progress bar
function updateProgress() {
    completed++;
    bar.tick();
    if (completed === slpFiles.length) {
        console.log('Processing complete!');
    }
}

// Function to process a single file using a worker thread
function processFile(filePath) {
    return new Promise((resolve, reject) => {
        const worker = new Worker(path.join(__dirname, 'worker.js'), {
            workerData: {
                filePath: filePath,
                outputDir: outputDir
            }
        });

        worker.on('message', resolve);
        worker.on('error', reject);
        worker.on('exit', (code) => {
            if (code !== 0) {
                reject(new Error(`Worker stopped with exit code ${code}`));
            }
        });
    });
}

// Process files with concurrency
const concurrency = 4; // Number of concurrent workers
let index = 0;

function startNextBatch() {
    const promises = [];

    for (let i = 0; i < concurrency && index < slpFiles.length; i++, index++) {
        promises.push(processFile(slpFiles[index]).then(updateProgress));
    }

    if (promises.length > 0) {
        Promise.all(promises).then(startNextBatch).catch(console.error);
    }
}

// Start processing
startNextBatch();
