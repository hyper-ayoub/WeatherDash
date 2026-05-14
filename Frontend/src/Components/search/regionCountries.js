export const REGION_COUNTRIES = {
  Africa: [
    "DZ", "AO", "BJ", "BW", "BF", "BI", "CM", "CV", "CF", "TD",
    "KM", "CD", "CG", "CI", "DJ", "EG", "GQ", "ER", "ET", "GA",
    "GM", "GH", "GN", "GW", "KE", "LS", "LR", "LY", "MG", "MW",
    "ML", "MR", "MU", "MA", "MZ", "NA", "NE", "NG", "RW", "ST",
    "SN", "SC", "SL", "SO", "ZA", "SS", "SD", "SZ", "TZ", "TG",
    "TN", "UG", "ZM", "ZW",
  ],
  Antarctica: ["AQ"],
  Europe: [
    "AL", "AD", "AT", "BY", "BE", "BA", "BG", "HR", "CZ", "DK",
    "EE", "FI", "FR", "DE", "GR", "HU", "IS", "IE", "IT", "LV",
    "LI", "LT", "LU", "MT", "MD", "MC", "ME", "NL", "MK", "NO",
    "PL", "PT", "RO", "RU", "SM", "RS", "SK", "SI", "ES", "SE",
    "CH", "UA", "GB", "VA",
  ],
  "North America": [
    "US", "CA", "MX", "GL", "BM", "PM", "AG", "BS", "BB", "BZ",
    "CR", "CU", "DM", "DO", "SV", "GD", "GT", "HT", "HN", "JM",
    "KN", "LC", "NI", "PA", "VC", "TT",
  ],
  "South America": [
    "AR", "BO", "BR", "CL", "CO", "EC", "FK", "GF", "GY", "PY",
    "PE", "SR", "UY", "VE",
  ],
  "Middle East": [
    "AE", "BH", "CY", "EG", "IR", "IQ", "IL", "JO", "KW", "LB",
    "OM", "PS", "QA", "SA", "SY", "TR", "YE",
  ],
  "South Asia": ["AF", "BD", "BT", "IN", "MV", "NP", "PK", "LK"],
  "Southeast Asia": [
    "BN", "KH", "ID", "LA", "MY", "MM", "PH", "SG", "TH", "TL", "VN",
  ],
  "East Asia": ["CN", "JP", "KP", "KR", "MN", "TW"],
  "Central Asia": ["KZ", "KG", "TJ", "TM", "UZ"],
  Oceania: [
    "AU", "NZ", "FJ", "PG", "SB", "VU", "WS", "TO", "KI", "NR",
    "TV", "PW", "FM", "CK", "NU", "AS",
  ],
};

export function getRegionCountries(regionName) {
  return REGION_COUNTRIES[regionName] || [];
}
