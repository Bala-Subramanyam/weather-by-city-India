import { readFileSync, writeFileSync } from "fs";
import { join } from "path";

// Column mapping (based on GeoNames format)
const fields = [
  "id", "name", "ascii_name", "alternates", "latitude", "longitude",
  "feature_class", "feature_code", "country_code", "alt_country_codes",
  "cc2", "admin1_code", "admin2_code", "admin3_code", "admin4_code",
  "population", "elevation", "dem", "timezone", "modification_date"
];

// Read input file
const input = readFileSync(join(__dirname, "IN.txt"), "utf-8");
const lines = input.split("\n").filter(line => line.trim() !== "");

// Parse each line into a city object
const data = lines.map(line => {
  const parts = line.split("\t");
  const record = {};

  fields.forEach((field, i) => {
    let value = parts[i] || null;

    if (field === "latitude" || field === "longitude") {
      value = value ? parseFloat(value) : null;
    } else if (["population", "elevation", "dem"].includes(field)) {
      value = value ? parseInt(value, 10) : null;
    } else if (["alternates", "alt_country_codes"].includes(field)) {
      value = value ? value.split(",") : [];
    }

    record[field] = value;
  });

  return record;
});

// Save the parsed data
const outputPath = join(__dirname, "../all_cities.json");
writeFileSync(outputPath, JSON.stringify(data, null, 2), "utf-8");

console.log("✅ Conversion complete! Check all_cities.json");
