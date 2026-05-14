import pycountry_convert as pc

def detect_region(country):
    try:
        # Asia
        if country in ["JP", "CN", "KR", "MN", "TW", "HK", "MO"]:
            return "East Asia"

        elif country in ["IN", "PK", "BD", "NP", "LK", "BT", "MV", "AF"]:
            return "South Asia"

        elif country in ["TH", "VN", "MY", "ID", "PH", "SG", "KH", "LA", "MM", "BN", "TL"]:
            return "Southeast Asia"

        elif country in ["KZ", "UZ", "TM", "KG", "TJ"]:
            return "Central Asia"

        # Middle East + Africa
        elif country in [
            "AE", "SA", "QA", "KW", "OM", "IQ", "TR", "IR", "IL", "JO",
            "LB", "SY", "YE", "BH", "PS",

            "MA", "DZ", "TN", "LY", "EG", "SD",

            "NG", "GH", "CI", "SN", "ML", "BF", "NE", "TG", "BJ",
            "GM", "GN", "SL", "LR", "CV",

            "CM", "GA", "CG", "CD", "CF", "TD", "GQ", "ST",

            "KE", "TZ", "UG", "RW", "BI", "ET", "SO", "DJ", "ER", "SS",

            "ZA", "NA", "BW", "ZW", "ZM", "MW", "MZ", "AO", "LS", "SZ"
        ]:
            return "Middle East"

        # Europe
        elif country in [
            "FR", "DE", "IT", "ES", "PT", "BE", "NL", "LU", "CH", "AT",
            "PL", "CZ", "SK", "HU", "SI", "HR", "BA", "RS", "ME", "MK",
            "AL", "GR", "BG", "RO", "MD", "UA", "BY", "LT", "LV", "EE",
            "DK", "SE", "NO", "FI", "IS", "IE", "GB"
        ]:
            return "Europe"

        # North America
        elif country in ["US", "CA", "MX", "GT", "BZ", "SV", "HN", "NI", "CR", "PA"]:
            return "North America"

        # South America
        elif country in [
            "BR", "AR", "CL", "PE", "CO", "VE", "UY", "PY", "BO",
            "EC", "GY", "SR"
        ]:
            return "South America"

        # Oceania
        elif country in ["AU", "NZ", "FJ", "PG", "WS", "TO", "VU", "SB"]:
            return "Oceania"

        # Fallback using pycountry_convert
        cc = pc.country_alpha2_to_continent_code(country)

        if cc == "AF":
            return "Africa"
        elif cc == "EU":
            return "Europe"
        elif cc == "NA":
            return "North America"
        elif cc == "SA":
            return "South America"
        elif cc == "OC":
            return "Oceania"
        elif cc == "AN":
            return "Antarctica"
        else:
            return "Unknown"

    except Exception:
        return "Unknown region for this country"