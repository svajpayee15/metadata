const fs = require('fs');
const path = require('path');

const OUTPUT_DIR = './build';
const CSV_PATH = './metadata.csv';

// 1. TREASURY (Sequential - No Shuffling)
const TREASURY_CONFIG = [
  { path: './images-sorted/treasury/pod_legendary', rarity: 'Legendary' },
  { path: './images-sorted/treasury/pod_1-1', rarity: '1/1' },
  { path: './images-sorted/treasury/pod_rare', rarity: 'Rare' },
  { path: './images-sorted/treasury/pod_common', rarity: 'Common' }
];

// 2. COMMUNITY (To be Shuffled)
const COMMUNITY_CONFIG = [
  { path: './images-sorted/pod_legendary', rarity: 'Legendary' },
  { path: './images-sorted/pod_1-1', rarity: '1/1' },
  { path: './images-sorted/pod_rare', rarity: 'Rare' },
  { path: './images-sorted/pod_common', rarity: 'Common' }
];

// Ensure clean build directory
if (fs.existsSync(OUTPUT_DIR)) {
    console.log("Cleaning old build folder...");
    fs.rmSync(OUTPUT_DIR, { recursive: true, force: true });
}
fs.mkdirSync(OUTPUT_DIR);

let tokenID = 1;
let csvContent = 'tokenID,name,file_name,description,attributes[Rarity]\n';

const description = "The Official Pacific Pod NFT on Ethereum backed by Pacifica Finance.";

// --- STAGE 1: TREASURY (1 to 80 approx) ---
console.log("Processing Treasury (Sequential)...");
TREASURY_CONFIG.forEach(item => {
    const dirPath = path.resolve(__dirname, item.path);
    if (fs.existsSync(dirPath)) {
        const files = fs.readdirSync(dirPath).filter(f => f.toLowerCase().endsWith('.png'));
        files.forEach(file => {
            copyAndRecord(dirPath, file, item.rarity);
        });
    }
});

const lastTreasuryID = tokenID - 1;

// --- STAGE 2: COMMUNITY (Shuffled) ---
console.log("\nPooling Community NFTs for Shuffling...");
let communityPool = [];

COMMUNITY_CONFIG.forEach(item => {
    const dirPath = path.resolve(__dirname, item.path);
    if (fs.existsSync(dirPath)) {
        const files = fs.readdirSync(dirPath).filter(f => f.toLowerCase().endsWith('.png'));
        files.forEach(file => {
            communityPool.push({ dirPath, file, rarity: item.rarity });
        });
    }
});

// Fisher-Yates Shuffle
for (let i = communityPool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [communityPool[i], communityPool[j]] = [communityPool[j], communityPool[i]];
}

console.log("Processing Community (Randomized)...");
communityPool.forEach(item => {
    copyAndRecord(item.dirPath, item.file, item.rarity);
});

// --- HELPER: COPY & METADATA ---
function copyAndRecord(dirPath, file, rarity) {
    const oldPath = path.join(dirPath, file);
    const newFileName = `${tokenID}.png`;
    const newPath = path.join(OUTPUT_DIR, newFileName);

    // Using Copy instead of Rename to keep your originals safe
    fs.copyFileSync(oldPath, newPath);

    const nftName = `Pod #${tokenID}`;
    csvContent += `${tokenID},${nftName},${newFileName},${description},${rarity}\n`;
    tokenID++;
}

// Write the final CSV
fs.writeFileSync(CSV_PATH, csvContent);

console.log(`\n✅ Mission Accomplished!`);
console.log(`📂 Total images in /build: ${tokenID - 1}`);
console.log(`🛡️  Treasury sequential: 1 to ${lastTreasuryID}`);
console.log(`🎲  Community shuffled: ${lastTreasuryID + 1} to ${tokenID - 1}`);
console.log(`📄  Metadata generated: metadata.csv`);