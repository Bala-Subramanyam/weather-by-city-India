import { existsSync, mkdirSync, writeFileSync } from "fs";
import { join } from "path";

// Load all cities (your cleaned GeoNames data)
import allCities from "../all_cities.json";

// Object to hold cities grouped by cc2
const grouped = {};

for (const city of allCities) {
  // Only include real populated places
  if (city.feature_class !== "P") continue;

  const cc2 = city.cc2;
  if (!cc2) continue; // Skip entries without a valid cc2

  // Simplify the city object
  const slim = {
    name: city.ascii_name.toLowerCase(),
    cc2: city.cc2,
    latitude: city.latitude,
    longitude: city.longitude,
  };

  // Group by cc2
  if (!grouped[cc2]) grouped[cc2] = [];
  grouped[cc2].push(slim);
}

// Output folder
const outputDir = join(__dirname, "../cities_by_cc2");

// Create the output directory if it doesn't exist
if (!existsSync(outputDir)) {
  mkdirSync(outputDir);
}

// Write one file per cc2
for (const cc2 in grouped) {
  const filename = join(outputDir, `${cc2.padStart(2, "0")}.json`);
  writeFileSync(filename, JSON.stringify(grouped[cc2], null, 2));
  console.log(`✔️  Saved ${grouped[cc2].length} cities to ${filename}`);
}

console.log("Done generating city files by cc2.");
