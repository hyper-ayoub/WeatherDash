import pycountry_convert as pc

def detect_region(country):
    try:
        if country in ["JP","CN","KR"]: return "East Asia"
        elif country in ["IN","PK","BD"]: return "South Asia"
        elif country in ["TH","VN","MY","ID","PH"]: return "Southeast Asia"
        elif country in ["KZ","UZ","TM"]: return "Central Asia"
        elif country in ["AE","SA","QA","KW","OM"]: return "Middle East"
        
        cc = pc.country_alpha2_to_continent_code(country)
        if cc == "AF": return "Africa"
        elif cc == "EU": return "Europe"
        elif cc == "NA": return "North America"
        elif cc == "SA": return "South America"
        elif cc == "OC": return "Oceania"
        elif cc == "AN": return "Antarctica"
        else: return "Unknown"
    except:
        return "Unknown region for this country"
