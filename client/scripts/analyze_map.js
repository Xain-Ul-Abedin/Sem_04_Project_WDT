import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const mapPath = path.join(__dirname, '../public/img/map.svg');
const svgContent = fs.readFileSync(mapPath, 'utf8');

// Regex to find clipPath definitions and their path data
// Looking for <clipPath id="..."> <path d="..." ... /> </clipPath>
// The format in the file provided was: <clipPath id="..."><path d="..." .../></clipPath>
const clipPathRegex = /<clipPath id="([^"]+)">\s*<path d="([^"]+)"/g;

let match;
const calculatedLocations = [];

while ((match = clipPathRegex.exec(svgContent)) !== null) {
    const id = match[1];
    const pathData = match[2];

    // Simple centroid calculation for the path
    // valid path commands in this file seem to be M, L, Z. 
    // We will extract all numbers and average them to find the center.
    // This is an approximation but works well for simple shapes like icons/masks.

    const numbers = pathData.match(/-?\d+(\.\d+)?/g).map(Number);

    if (numbers.length >= 2) {
        let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;

        // Creating pairs might be complex if commands differ, but typically M x y L x y ...
        // We can just grab all X's and Y's if we assume checking min/max of the bounding box

        for (let i = 0; i < numbers.length; i += 2) {
            const x = numbers[i];
            const y = numbers[i + 1];

            if (x < minX) minX = x;
            if (x > maxX) maxX = x;
            if (y < minY) minY = y;
            if (y > maxY) maxY = y;
        }

        const probCenterX = (minX + maxX) / 2;
        const probCenterY = (minY + maxY) / 2;

        // Heuristic: Filter out the full map mask if it exists (usually finding the biggest one)
        // or identifiable by specific ID if known. For now, output all.

        calculatedLocations.push({
            id: id,
            x: probCenterX,
            y: probCenterY,
            width: maxX - minX,
            height: maxY - minY
        });
    }
}

const outputPath = path.join(__dirname, '../src/data/mapCoordinates.json');
fs.writeFileSync(outputPath, JSON.stringify(calculatedLocations, null, 2), 'utf8');
console.log(`Coordinates written to ${outputPath}`);
