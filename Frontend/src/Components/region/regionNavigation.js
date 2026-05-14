export const REGIONS = [
  { name: "Home", icon: "home", path: "/home" },
  { name: "Africa", icon: "public", path: "/africa" },
  { name: "Europe", icon: "euro_symbol", path: "/europe" },
  { name: "North America", icon: "map", path: "/north-america" },
  { name: "South America", icon: "terrain", path: "/south-america" },
  { name: "Middle East", icon: "wb_sunny", path: "/middle-east" },
  { name: "South Asia", icon: "filter_drama", path: "/south-asia" },
  { name: "Southeast Asia", icon: "umbrella", path: "/southeast-asia" },
  { name: "East Asia", icon: "temp_preferences_custom", path: "/east-asia" },
  { name: "Central Asia", icon: "landscape", path: "/central-asia" },
  { name: "Oceania", icon: "waves", path: "/oceania" },
  { name: "Antarctica", icon: "ac_unit", path: "/antarctica" },
  { name: "Globe", icon: "globe", path: "/globe" },
];

const REGION_BY_PATH = new Map(REGIONS.map((region) => [region.path, region.name]));

export function getRegionNameFromPath(pathname) {
  return REGION_BY_PATH.get(pathname) || null;
}
