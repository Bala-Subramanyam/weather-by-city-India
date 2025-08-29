export interface Location {
  ascii_name: string;
  cc2: string;
  type: "State" | "Union Territory";
}

// State CC2 codes
const utCodes = new Set([
  "22","14","12","07","05","01","41","52"
]);

// Raw data from your JSON
const rawLocations = [
  { ascii_name: "West Bengal", cc2: "28" },
  { ascii_name: "Uttar Pradesh", cc2: "36" },
  { ascii_name: "Tripura", cc2: "26" },
  { ascii_name: "Telangana", cc2: "40" },
  { ascii_name: "Tamil Nadu", cc2: "25" },
  { ascii_name: "Sikkim", cc2: "29" },
  { ascii_name: "Rajasthan", cc2: "24" },
  { ascii_name: "Punjab", cc2: "23" },
  { ascii_name: "Union Territory of Puducherry", cc2: "22" },
  { ascii_name: "Odisha", cc2: "21" },
  { ascii_name: "Nagaland", cc2: "20" },
  { ascii_name: "Mizoram", cc2: "31" },
  { ascii_name: "Meghalaya", cc2: "18" },
  { ascii_name: "Manipur", cc2: "17" },
  { ascii_name: "Maharashtra", cc2: "16" },
  { ascii_name: "Madhya Pradesh", cc2: "35" },
  { ascii_name: "Lakshadweep", cc2: "14" },
  { ascii_name: "Kerala", cc2: "13" },
  { ascii_name: "Karnataka", cc2: "19" },
  { ascii_name: "Jammu and Kashmir", cc2: "12" },
  { ascii_name: "Himachal Pradesh", cc2: "11" },
  { ascii_name: "Haryana", cc2: "10" },
  { ascii_name: "Gujarat", cc2: "09" },
  { ascii_name: "Goa", cc2: "33" },
  { ascii_name: "Delhi", cc2: "07" },
  { ascii_name: "Chandigarh", cc2: "05" },
  { ascii_name: "Bihar", cc2: "34" },
  { ascii_name: "Assam", cc2: "03" },
  { ascii_name: "Arunachal Pradesh", cc2: "30" },
  { ascii_name: "Andhra Pradesh", cc2: "02" },
  { ascii_name: "Andaman and Nicobar Islands", cc2: "01" },
  { ascii_name: "Chhattisgarh", cc2: "37" },
  { ascii_name: "Jharkhand", cc2: "38" },
  { ascii_name: "Uttarakhand", cc2: "39" },
  { ascii_name: "Ladakh", cc2: "41" },
  { ascii_name: "Dadra and Nagar Haveli and Daman and Diu", cc2: "52" },
];

// Enrich with type info
export const locations: Location[] = rawLocations.map((loc) => ({
  ...loc,
  type: utCodes.has(loc.cc2) ? "Union Territory" : "State",
}));
