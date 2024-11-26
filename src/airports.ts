import axios from 'axios';
import { parse, Options } from 'csv-parse';
import { promisify } from 'util';
import fs from 'fs-jetpack';
import path from 'path';

const url = 'https://davidmegginson.github.io/ourairports-data/airports.csv';

type AirportData = {
  id: string;
  ident: string;
  type:
    | 'closed_airport'
    | 'heliport'
    | 'large_airport'
    | 'medium_airport'
    | 'seaplane_base'
    | 'small_airport';
  name: string;
  latitude_deg: number;
  longitude_deg: number;
  elevation_ft: number;
  continent: 'AF' | 'AN' | 'AS' | 'EU' | 'NA' | 'OC' | 'SA';
  iso_country: string;
  iso_region: string;
  municipality: string;
  scheduled_service: 'yes' | 'no';
  gps_code: string;
  iata_code: string;
  local_code: string;
  home_link: string;
  wikipedia_link: string;
  keywords: string;
};

type Airport = {
  name: string;
  lat: number;
  lon: number;
};

const output = './data';

export const getAirports = async (): Promise<Airport[]> => {
  const countriesCsv = await axios.get<string>(url);
  const parseCsv = promisify<string, Options>(parse);

  const json = (await parseCsv(countriesCsv.data, {
    columns: true,
  })) as unknown as AirportData[];

  const data: Airport[] = [];
  for (const item of json) {
    // if (
    //   item.type === 'large_airport' ||
    //   item.type === 'medium_airport' ||
    //   item.type === 'small_airport'
    // )
    data.push({
      name: item.name,
      lat: Number(item.latitude_deg),
      lon: Number(item.longitude_deg),
    });
  }

  await fs.writeAsync(path.resolve(output, 'airports-data.json'), json);
  await fs.writeAsync(path.resolve(output, 'airports.json'), data);
  return data;
};
