# Weather India App

A simple web application to fetch and display real-time weather information for cities across India. Users can select a state or union territory, then a city, and view current weather conditions along with a 7-day hourly forecast. The app uses the Open-Meteo API for weather data and GeoNames data for Indian cities and states.

Live Demo: [https://weather-by-city-india.netlify.app/](https://weather-by-city-india.netlify.app/)

## Features

- **State/Union Territory Selection**: Dropdown to choose from 28 states and 8 union territories in India.
- **City Selection**: Dynamic loading of cities based on the selected state/UT, with search functionality.
- **Current Weather**: Displays temperature, weather condition, and an icon for the current time.
- **Hourly Forecast**: Shows weather predictions for the next 7 days, grouped by day, with hourly details including temperature, condition, and icons.
- **Weather Icons**: Custom icons for conditions like clear sky, rain, snow, thunderstorm, and a special "Hot" indicator for temperatures ≥35°C.
- **Responsive Design**: Works on desktop and mobile devices.
- **Data Optimization**: Cities are pre-grouped by state codes (cc2) into static JSON files for fast loading.

## Tech Stack

- **Frontend**: React (with TypeScript), Shadcn/UI components, Lucide icons.
- **Data Processing**: Node.js scripts for converting GeoNames data to JSON and grouping cities.
- **API**: Open-Meteo for weather forecasts (no API key required).
- **Deployment**: Netlify (static site hosting).
- **Other**: Fetch API for data loading, AbortController for handling async requests.

## Data Sources

- **GeoNames**: Indian cities data from [IN.txt](https://download.geonames.org/export/dump/IN.zip). Processed to extract populated places (feature_class: "P") and group by state codes (cc2).
  - Original format: Tab-separated rows with fields like id, name, latitude, longitude, etc.
  - Converted to `all_cities.json` using a Node.js script.
  - States/UTs extracted based on feature_class: "A" and feature_code: "ADM1".
  - Cities filtered and slimmed down to {name, cc2, latitude, longitude} and saved as separate `cc2.json` files (e.g., `01.json` for Andaman and Nicobar Islands).
- **Weather API**: [Open-Meteo Forecast API](https://open-meteo.com/en/docs) for hourly temperature, weather codes, and current weather.
  - Weather codes mapped to human-readable conditions and icons (e.g., 0 = Clear Sky, 61-65 = Rain).
- **Static Assets**: City JSON files served from `/public/data/cities_by_cc2/` for client-side fetching.

## Folder Structure
The project is organized into two main directories: `weather-ui` (frontend) and `data` (scripts and raw data). The full repo is `weather-india-app`.

```plaintext
weather-india-app/
├── data/                        # Data processing scripts and raw files
│   ├── scripts/
│   │   ├── txt_to_json.js       # Converts IN.txt to all_cities.json
│   │   └── split-cities-by_cc2.js # Groups cities into cc2.json files
│   ├── all_cities.json          # Processed JSON from IN.txt
│   └── IN.txt                   # Raw GeoNames data (ignored in Git due to size: 325MB)
├── weather-ui/                  # React frontend (deployed to Netlify)
│   ├── public/
│   │   └── data/
│   │       └── cities_by_cc2/   # Generated cc2.json files (e.g., 01.json, 02.json, ...)
│   ├── src/
│   │   ├── components/          # UI components
│   │   │   ├── ui/              # Shadcn/UI primitives (Input, Popover, Command, etc.)
│   │   │   ├── city-selector.tsx # City dropdown component
│   │   │   ├── state-selector.tsx # State/UT dropdown component
│   │   │   └── weather-fetcher.tsx # Fetches and displays weather data
│   │   ├── data/
│   │   │   └── states_by_cc2.ts # Hardcoded states/UTs with cc2 codes
│   │   ├── App.tsx              # Root app component
│   │   ├── weatherPage.tsx      # Main page connecting selectors and fetcher
│   │   └── index.tsx            # React entry point
│   ├── package.json
│   ├── tsconfig.json
│   └── README.md                # This file
└── README.md                    # Root README 
```
The app follows an MVC-like structure for clarity:

Models: Data files (JSON/TS).
Views: Components (e.g., selectors, cards).
Controllers: Logic in components (e.g., fetching, state management).

## Installation and Setup

**Clone the Repo**:
```
git clone https://github.com/Bala-Subramanyam/weather-by-city-India-app.git
```
-   cd weather-india-app/weather-ui

**Install Dependencies**:
```
npm install
```
**Generate Data Files**:
-   Download `IN.txt` from GeoNames and place it in `data/`.
-   Run the conversion script:
-   cd ../data/scripts
```
node txt_to_json.js
```
-   run the grouping script:
```
node split-cities-by_cc2.js
```
-   Move the generated `cities_by_cc2/` folder to `weather-ui/public/data/`.

**Run Locally**:

-   cd ../../weather-ui
```
-npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

## Usage

1. Select a State or Union Territory from the dropdown.
2. Once loaded, select a City from the second dropdown (supports search).
3. The app will automatically fetch and display current weather and a 7-day hourly forecast.
4. Scroll horizontally for hourly details per day.

**Notes**:
- City names are lowercase in JSON for consistency but capitalized in UI.
- Forecast is in IST (Asia/Kolkata timezone).
- Current weather may slightly differ from hourly forecasts due to API updates.
- No backend server needed; all data is static or fetched client-side.

## Deployment

- The app is deployed on Netlify using the `weather-ui` directory as the base.
- Connect your GitHub repo to Netlify, set base directory to `weather-ui`, and build command to `npm run build`.
- Deployed URL: [https://weather-by-city-india.netlify.app/](https://weather-by-city-india.netlify.app/)

## Credits

- **GeoNames**: For city data.
- **Open-Meteo**: For free weather API.
- **Shadcn/UI**: For UI components.
- **Lucide**: For icons.

## License
Feel free to fork and modify!
