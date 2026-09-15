export interface SpaceAgency {
  id: string;
  name: string;
  acronym: string;
  country: string;
  countryCode: string;
  website: string;
  email: string | null;
  region: "americas" | "europe" | "asia_pacific" | "africa" | "middle_east" | "international";
}

function getCountryCode(country: string): string {
  const codes: Record<string, string> = {
    "United States": "US", "Russia": "RU", "China": "CN", "India": "IN", "Japan": "JP",
    "Europe": "EU", "France": "FR", "Germany": "DE", "Italy": "IT", "United Kingdom": "GB",
    "South Korea": "KR", "Iran": "IR", "Israel": "IL", "Canada": "CA", "Argentina": "AR",
    "Brazil": "BR", "Mexico": "MX", "Bolivia": "BO", "Chile": "CL", "Colombia": "CO",
    "Ecuador": "EC", "Paraguay": "PY", "Peru": "PE", "Venezuela": "VE", "Cuba": "CU",
    "Costa Rica": "CR", "Panama": "PA", "Jamaica": "JM", "Trinidad and Tobago": "TT",
    "Australia": "AU", "Azerbaijan": "AZ", "Bahrain": "BH", "Indonesia": "ID",
    "Kazakhstan": "KZ", "Malaysia": "MY", "New Zealand": "NZ", "Pakistan": "PK",
    "Philippines": "PH", "Singapore": "SG", "Taiwan": "TW", "Thailand": "TH",
    "Turkey": "TR", "United Arab Emirates": "AE", "Vietnam": "VN", "Bangladesh": "BD",
    "Sri Lanka": "LK", "Mongolia": "MN", "Uzbekistan": "UZ", "Turkmenistan": "TM",
    "Kyrgyzstan": "KG", "Tajikistan": "TJ", "Nepal": "NP", "Bhutan": "BT",
    "Myanmar": "MM", "Laos": "LA", "Cambodia": "KH", "Papua New Guinea": "PG",
    "Fiji": "FJ", "Algeria": "DZ", "Austria": "AT", "Belgium": "BE",
    "Czech Republic": "CZ", "Denmark": "DK", "Finland": "FI", "Greece": "GR",
    "Hungary": "HU", "Luxembourg": "LU", "Netherlands": "NL", "Norway": "NO",
    "Poland": "PL", "Portugal": "PT", "Romania": "RO", "Spain": "ES",
    "Sweden": "SE", "Switzerland": "CH", "Ukraine": "UA", "Armenia": "AM",
    "Scotland": "GB", "Iraq": "IQ", "Jordan": "JO", "Qatar": "QA", "Oman": "OM",
    "Kuwait": "KW", "Egypt": "EG", "Ghana": "GH", "Kenya": "KE", "Morocco": "MA",
    "Nigeria": "NG", "Rwanda": "RW", "Saudi Arabia": "SA", "South Africa": "ZA",
    "Tunisia": "TN", "Zimbabwe": "ZW", "Ethiopia": "ET", "Angola": "AO",
    "Botswana": "BW", "Namibia": "NA", "Tanzania": "TZ", "Uganda": "UG",
    "Senegal": "SN", "Ivory Coast": "CI", "International": "INTL",
    "European Union": "EU", "Africa": "AF", "Latin America": "LATAM",
    "Arab League": "ARAB", "North Korea": "KP", "Ireland": "IE", "Bulgaria": "BG",
    "Croatia": "HR", "Slovenia": "SI", "Slovakia": "SK", "Estonia": "EE",
    "Latvia": "LV", "Lithuania": "LT", "Malta": "MT", "Cyprus": "CY",
    "Iceland": "IS", "Mauritius": "MU", "Zambia": "ZM", "Mozambique": "MZ",
    "Madagascar": "MG", "Cameroon": "CM", "Democratic Republic of Congo": "CD",
    "Sudan": "SD", "Libya": "LY", "Brunei": "BN", "Maldives": "MV",
    "Afghanistan": "AF", "Georgia": "GE", "Lebanon": "LB", "Syria": "SY",
    "Yemen": "YE", "Tonga": "TO", "Samoa": "WS", "Vanuatu": "VU",
    "Solomon Islands": "SB", "Uruguay": "UY", "Guyana": "GY", "Suriname": "SR",
    "Honduras": "HN", "Guatemala": "GT", "El Salvador": "SV", "Nicaragua": "NI",
    "Dominican Republic": "DO", "Puerto Rico": "PR", "Bahamas": "BS", "Barbados": "BB"
  };
  return codes[country] || "XX";
}

function getRegion(country: string): SpaceAgency["region"] {
  const americas = ["United States", "Canada", "Argentina", "Brazil", "Mexico", "Bolivia", "Chile", "Colombia", "Ecuador", "Paraguay", "Peru", "Venezuela", "Cuba", "Costa Rica", "Panama", "Jamaica", "Trinidad and Tobago", "Uruguay", "Guyana", "Suriname", "Honduras", "Guatemala", "El Salvador", "Nicaragua", "Dominican Republic", "Puerto Rico", "Bahamas", "Barbados", "Latin America"];
  const europe = ["Europe", "France", "Germany", "Italy", "United Kingdom", "Austria", "Belgium", "Czech Republic", "Denmark", "Finland", "Greece", "Hungary", "Luxembourg", "Netherlands", "Norway", "Poland", "Portugal", "Romania", "Spain", "Sweden", "Switzerland", "Ukraine", "Armenia", "Scotland", "European Union", "Ireland", "Bulgaria", "Croatia", "Slovenia", "Slovakia", "Estonia", "Latvia", "Lithuania", "Malta", "Cyprus", "Iceland", "Russia", "Georgia"];
  const asiaPacific = ["China", "India", "Japan", "South Korea", "Australia", "Indonesia", "Kazakhstan", "Malaysia", "New Zealand", "Pakistan", "Philippines", "Singapore", "Taiwan", "Thailand", "Vietnam", "Bangladesh", "Sri Lanka", "Mongolia", "Uzbekistan", "Turkmenistan", "Kyrgyzstan", "Tajikistan", "Nepal", "Bhutan", "Myanmar", "Laos", "Cambodia", "Papua New Guinea", "Fiji", "North Korea", "Brunei", "Maldives", "Tonga", "Samoa", "Vanuatu", "Solomon Islands", "Azerbaijan"];
  const africa = ["Algeria", "Ghana", "Kenya", "Morocco", "Nigeria", "Rwanda", "South Africa", "Tunisia", "Zimbabwe", "Ethiopia", "Angola", "Botswana", "Namibia", "Tanzania", "Uganda", "Senegal", "Ivory Coast", "Africa", "Mauritius", "Zambia", "Mozambique", "Madagascar", "Cameroon", "Democratic Republic of Congo", "Sudan", "Libya"];
  const middleEast = ["Iran", "Israel", "Bahrain", "Turkey", "United Arab Emirates", "Iraq", "Jordan", "Qatar", "Oman", "Kuwait", "Egypt", "Saudi Arabia", "Arab League", "Lebanon", "Syria", "Yemen"];
  
  if (americas.includes(country)) return "americas";
  if (europe.includes(country)) return "europe";
  if (asiaPacific.includes(country)) return "asia_pacific";
  if (africa.includes(country)) return "africa";
  if (middleEast.includes(country)) return "middle_east";
  return "international";
}

function parseEmail(email: string): string | null {
  if (!email || email === "Not found" || email.startsWith("Contact via")) {
    return null;
  }
  return email;
}

export const spaceAgencies: SpaceAgency[] = [
  { id: "nasa", name: "National Aeronautics and Space Administration", acronym: "NASA", country: "United States", countryCode: "US", website: "https://www.nasa.gov", email: "public-inquiries@hq.nasa.gov", region: "americas" },
  { id: "roscosmos", name: "Roscosmos State Corporation", acronym: "Roscosmos", country: "Russia", countryCode: "RU", website: "https://www.roscosmos.ru", email: "info@roscosmos.ru", region: "europe" },
  { id: "cnsa", name: "China National Space Administration", acronym: "CNSA", country: "China", countryCode: "CN", website: "http://www.cnsa.gov.cn", email: "cnsa@cnsa.gov.cn", region: "asia_pacific" },
  { id: "isro", name: "Indian Space Research Organisation", acronym: "ISRO", country: "India", countryCode: "IN", website: "https://www.isro.gov.in", email: "isropr@isro.gov.in", region: "asia_pacific" },
  { id: "jaxa", name: "Japan Aerospace Exploration Agency", acronym: "JAXA", country: "Japan", countryCode: "JP", website: "https://global.jaxa.jp", email: null, region: "asia_pacific" },
  { id: "esa", name: "European Space Agency", acronym: "ESA", country: "Europe", countryCode: "EU", website: "https://www.esa.int", email: "media@esa.int", region: "europe" },
  { id: "cnes", name: "National Centre for Space Studies", acronym: "CNES", country: "France", countryCode: "FR", website: "https://cnes.fr", email: null, region: "europe" },
  { id: "dlr", name: "German Aerospace Center", acronym: "DLR", country: "Germany", countryCode: "DE", website: "https://www.dlr.de", email: null, region: "europe" },
  { id: "asi", name: "Italian Space Agency", acronym: "ASI", country: "Italy", countryCode: "IT", website: "https://www.asi.it", email: "stampa@asi.it", region: "europe" },
  { id: "uksa", name: "UK Space Agency", acronym: "UKSA", country: "United Kingdom", countryCode: "GB", website: "https://www.gov.uk/government/organisations/uk-space-agency", email: "info@ukspaceagency.gov.uk", region: "europe" },
  { id: "kasa", name: "Korea AeroSpace Administration", acronym: "KASA", country: "South Korea", countryCode: "KR", website: "https://www.kasa.go.kr", email: null, region: "asia_pacific" },
  { id: "isa-iran", name: "Iranian Space Agency", acronym: "ISA-Iran", country: "Iran", countryCode: "IR", website: "https://www.isa.ir", email: "info@isa.ir", region: "middle_east" },
  { id: "isa", name: "Israel Space Agency", acronym: "ISA", country: "Israel", countryCode: "IL", website: "https://www.space.gov.il", email: null, region: "middle_east" },
  { id: "csa-ca", name: "Canadian Space Agency", acronym: "CSA", country: "Canada", countryCode: "CA", website: "https://www.asc-csa.gc.ca", email: "asc.info.csa@asc-csa.gc.ca", region: "americas" },
  { id: "conae", name: "National Space Activities Commission", acronym: "CONAE", country: "Argentina", countryCode: "AR", website: "https://www.argentina.gob.ar/conae", email: "atencion.usuario@conae.gov.ar", region: "americas" },
  { id: "aeb", name: "Brazilian Space Agency", acronym: "AEB", country: "Brazil", countryCode: "BR", website: "https://www.gov.br/aeb", email: "imprensa@aeb.gov.br", region: "americas" },
  { id: "aem", name: "Mexican Space Agency", acronym: "AEM", country: "Mexico", countryCode: "MX", website: "https://www.gob.mx/aem", email: "contacto@aem.gob.mx", region: "americas" },
  { id: "abe", name: "Bolivian Space Agency", acronym: "ABE", country: "Bolivia", countryCode: "BO", website: "https://www.abe.bo", email: "info@abe.bo", region: "americas" },
  { id: "ace", name: "Chilean Space Agency", acronym: "ACE", country: "Chile", countryCode: "CL", website: "https://www.minciencia.gob.cl", email: null, region: "americas" },
  { id: "cce", name: "Colombian Space Commission", acronym: "CCE", country: "Colombia", countryCode: "CO", website: "https://www.colombiaspace.org", email: "info@colombiaspace.org", region: "americas" },
  { id: "exa", name: "Ecuadorian Civilian Space Agency", acronym: "EXA", country: "Ecuador", countryCode: "EC", website: "https://www.exa.ec", email: "info@exa.ec", region: "americas" },
  { id: "aep", name: "Paraguay Space Agency", acronym: "AEP", country: "Paraguay", countryCode: "PY", website: "https://www.aep.gov.py", email: null, region: "americas" },
  { id: "conida", name: "National Commission for Aerospace Research and Development", acronym: "CONIDA", country: "Peru", countryCode: "PE", website: "https://www.conida.gob.pe", email: "secretaria_general@conida.gob.pe", region: "americas" },
  { id: "abae", name: "Bolivarian Agency for Space Activities", acronym: "ABAE", country: "Venezuela", countryCode: "VE", website: "http://www.abae.gob.ve", email: "info@abae.gob.ve", region: "americas" },
  { id: "csp", name: "Cuban Space Program", acronym: "CSP", country: "Cuba", countryCode: "CU", website: "https://www.academiaciencias.cu", email: null, region: "americas" },
  { id: "aec", name: "Costa Rica Space Agency", acronym: "AEC", country: "Costa Rica", countryCode: "CR", website: "https://www.conicit.go.cr", email: null, region: "americas" },
  { id: "psp", name: "Panama Space Program", acronym: "PSP", country: "Panama", countryCode: "PA", website: "https://www.senacyt.gob.pa", email: null, region: "americas" },
  { id: "jsa", name: "Jamaica Space Agency", acronym: "JSA", country: "Jamaica", countryCode: "JM", website: "https://www.mset.gov.jm", email: null, region: "americas" },
  { id: "ttsp", name: "Trinidad and Tobago Space Program", acronym: "TTSP", country: "Trinidad and Tobago", countryCode: "TT", website: "https://www.niherst.gov.tt", email: "info@niherst.gov.tt", region: "americas" },
  { id: "asa", name: "Australian Space Agency", acronym: "ASA", country: "Australia", countryCode: "AU", website: "https://www.space.gov.au", email: "enquiries@space.gov.au", region: "asia_pacific" },
  { id: "azercosmos", name: "Azerbaijan National Aerospace Agency", acronym: "Azercosmos", country: "Azerbaijan", countryCode: "AZ", website: "https://azercosmos.az", email: "info@azercosmos.az", region: "asia_pacific" },
  { id: "nssa", name: "Bahrain National Space Science Agency", acronym: "NSSA", country: "Bahrain", countryCode: "BH", website: "https://www.nssa.gov.bh", email: "info@nssa.gov.bh", region: "middle_east" },
  { id: "lapan", name: "National Institute of Aeronautics and Space", acronym: "LAPAN", country: "Indonesia", countryCode: "ID", website: "https://www.lapan.go.id", email: "humas@lapan.go.id", region: "asia_pacific" },
  { id: "kazcosmos", name: "Kazakhstan Aerospace Agency", acronym: "KazCosmos", country: "Kazakhstan", countryCode: "KZ", website: "https://www.kazcosmos.kz", email: "info@kazcosmos.kz", region: "asia_pacific" },
  { id: "angkasa", name: "Malaysian Space Agency", acronym: "ANGKASA", country: "Malaysia", countryCode: "MY", website: "https://www.angkasa.gov.my", email: "info@angkasa.gov.my", region: "asia_pacific" },
  { id: "nzsa", name: "New Zealand Space Agency", acronym: "NZSA", country: "New Zealand", countryCode: "NZ", website: "https://www.mbie.govt.nz/space", email: "nzspaceagency@mbie.govt.nz", region: "asia_pacific" },
  { id: "suparco", name: "Space and Upper Atmosphere Research Commission", acronym: "SUPARCO", country: "Pakistan", countryCode: "PK", website: "https://www.suparco.gov.pk", email: "am.pr@suparco.gov.pk", region: "asia_pacific" },
  { id: "philsa", name: "Philippine Space Agency", acronym: "PhilSA", country: "Philippines", countryCode: "PH", website: "https://philsa.gov.ph", email: "info@philsa.gov.ph", region: "asia_pacific" },
  { id: "ssta", name: "Singapore Space & Technology Association", acronym: "SSTA", country: "Singapore", countryCode: "SG", website: "https://www.space.org.sg", email: "info@space.org.sg", region: "asia_pacific" },
  { id: "tasa", name: "Taiwan Space Agency", acronym: "TASA", country: "Taiwan", countryCode: "TW", website: "https://www.tasa.org.tw", email: "service@tasa.org.tw", region: "asia_pacific" },
  { id: "gistda", name: "Geo-Informatics and Space Technology Development Agency", acronym: "GISTDA", country: "Thailand", countryCode: "TH", website: "https://www.gistda.or.th", email: "info@gistda.or.th", region: "asia_pacific" },
  { id: "tua", name: "Turkish Space Agency", acronym: "TUA", country: "Turkey", countryCode: "TR", website: "https://www.tua.gov.tr", email: "international@tua.gov.tr", region: "middle_east" },
  { id: "uaesa", name: "UAE Space Agency", acronym: "UAESA", country: "United Arab Emirates", countryCode: "AE", website: "https://www.space.gov.ae", email: "info@space.gov.ae", region: "middle_east" },
  { id: "vnsc", name: "Vietnam National Space Center", acronym: "VNSC", country: "Vietnam", countryCode: "VN", website: "https://vnsc.org.vn", email: "info@vnsc.org.vn", region: "asia_pacific" },
  { id: "sparrso", name: "Bangladesh Space Research and Remote Sensing Organization", acronym: "SPARRSO", country: "Bangladesh", countryCode: "BD", website: "https://www.sparrso.gov.bd", email: "sparrso@dhaka.net", region: "asia_pacific" },
  { id: "slsa", name: "Sri Lanka Space Academy", acronym: "SLSA", country: "Sri Lanka", countryCode: "LK", website: "https://www.mostr.gov.lk", email: "info@mostr.gov.lk", region: "asia_pacific" },
  { id: "msp", name: "Mongolian Space Program", acronym: "MSP", country: "Mongolia", countryCode: "MN", website: "https://www.num.edu.mn", email: null, region: "asia_pacific" },
  { id: "uzbekcosmos", name: "Uzbekistan Space Agency", acronym: "UzbekCosmos", country: "Uzbekistan", countryCode: "UZ", website: "https://www.uzspace.uz", email: "info@uzspace.uz", region: "asia_pacific" },
  { id: "tsp", name: "Turkmenistan Space Program", acronym: "TSP", country: "Turkmenistan", countryCode: "TM", website: "https://www.turkmenistan.gov.tm", email: null, region: "asia_pacific" },
  { id: "ksp", name: "Kyrgyzstan Space Program", acronym: "KSP", country: "Kyrgyzstan", countryCode: "KG", website: "https://www.gov.kg", email: null, region: "asia_pacific" },
  { id: "tasp", name: "Tajikistan Space Program", acronym: "TaSP", country: "Tajikistan", countryCode: "TJ", website: "https://www.tajikistan.gov.tj", email: null, region: "asia_pacific" },
  { id: "nsp", name: "Nepal Space Program", acronym: "NSP", country: "Nepal", countryCode: "NP", website: "https://www.moest.gov.np", email: null, region: "asia_pacific" },
  { id: "bsp", name: "Bhutan Space Program", acronym: "BSP", country: "Bhutan", countryCode: "BT", website: "https://www.gnhc.gov.bt", email: null, region: "asia_pacific" },
  { id: "msp-mm", name: "Myanmar Space Program", acronym: "MSP-MM", country: "Myanmar", countryCode: "MM", website: "https://www.mosti.gov.mm", email: null, region: "asia_pacific" },
  { id: "lsp", name: "Laos Space Program", acronym: "LSP", country: "Laos", countryCode: "LA", website: "https://www.most.gov.la", email: null, region: "asia_pacific" },
  { id: "casp", name: "Cambodia Space Program", acronym: "CaSP", country: "Cambodia", countryCode: "KH", website: "https://www.mptc.gov.kh", email: null, region: "asia_pacific" },
  { id: "pngsp", name: "Papua New Guinea Space Program", acronym: "PNGSP", country: "Papua New Guinea", countryCode: "PG", website: "https://www.ict.gov.pg", email: null, region: "asia_pacific" },
  { id: "fsp", name: "Fiji Space Program", acronym: "FSP", country: "Fiji", countryCode: "FJ", website: "https://www.govnet.gov.fj", email: null, region: "asia_pacific" },
  { id: "asal", name: "Algerian Space Agency", acronym: "ASAL", country: "Algeria", countryCode: "DZ", website: "https://www.asal.dz", email: "info@asal.dz", region: "africa" },
  { id: "alr", name: "Austrian Aeronautics and Space Agency", acronym: "ALR", country: "Austria", countryCode: "AT", website: "https://www.ffg.at", email: "office@ffg.at", region: "europe" },
  { id: "oewf", name: "Austrian Space Forum", acronym: "OeWF", country: "Austria", countryCode: "AT", website: "https://oewf.org", email: "office@oewf.org", region: "europe" },
  { id: "belspo", name: "Belgian Federal Science Policy Office (Space)", acronym: "BELSPO", country: "Belgium", countryCode: "BE", website: "https://www.belspo.be", email: "info@belspo.be", region: "europe" },
  { id: "wsl", name: "Walloon Space Logistics", acronym: "WSL", country: "Belgium", countryCode: "BE", website: "https://www.wallonia.be/space", email: null, region: "europe" },
  { id: "cso", name: "Czech Space Office", acronym: "CSO", country: "Czech Republic", countryCode: "CZ", website: "https://www.czechspace.cz", email: "info@czechspace.cz", region: "europe" },
  { id: "dsri", name: "Danish Space Research Institute", acronym: "DSRI", country: "Denmark", countryCode: "DK", website: "https://www.space.dtu.dk", email: "SFU-RUM@ufm.dk", region: "europe" },
  { id: "fmi", name: "Finnish Meteorological Institute", acronym: "FMI", country: "Finland", countryCode: "FI", website: "https://www.fmi.fi", email: "kirjaamo@fmi.fi", region: "europe" },
  { id: "hsa", name: "Hellenic Space Agency", acronym: "HSA", country: "Greece", countryCode: "GR", website: "https://hsa.gr", email: "info@hsa.gr", region: "europe" },
  { id: "hso", name: "Hungarian Space Office", acronym: "HSO", country: "Hungary", countryCode: "HU", website: "https://www.hunspace.eu", email: "info@hunspace.eu", region: "europe" },
  { id: "lsa-lu", name: "Luxembourg Space Agency", acronym: "LSA", country: "Luxembourg", countryCode: "LU", website: "https://space-agency.public.lu", email: "info@space-agency.lu", region: "europe" },
  { id: "nso", name: "Netherlands Space Office", acronym: "NSO", country: "Netherlands", countryCode: "NL", website: "https://www.spaceoffice.nl", email: "info@spaceoffice.nl", region: "europe" },
  { id: "nosa", name: "Norwegian Space Agency", acronym: "NOSA", country: "Norway", countryCode: "NO", website: "https://www.romsenter.no", email: "spaceagency@spaceagency.no", region: "europe" },
  { id: "polsa", name: "Polish Space Agency", acronym: "POLSA", country: "Poland", countryCode: "PL", website: "https://polsa.gov.pl", email: "biuro@polsa.gov.pl", region: "europe" },
  { id: "ptspace", name: "Portugal Space", acronym: "PT Space", country: "Portugal", countryCode: "PT", website: "https://www.portugalspace.pt", email: "info@portugalspace.pt", region: "europe" },
  { id: "rosa", name: "Romanian Space Agency", acronym: "ROSA", country: "Romania", countryCode: "RO", website: "https://www.rosa.ro", email: "rosa-hq@rosa.ro", region: "europe" },
  { id: "aee", name: "Spanish Space Agency", acronym: "AEE", country: "Spain", countryCode: "ES", website: "https://aee.gob.es", email: "informacion@aee.gob.es", region: "europe" },
  { id: "catsa", name: "Catalan Space Agency", acronym: "CatSA", country: "Spain", countryCode: "ES", website: "https://www.catalonia.com/space", email: null, region: "europe" },
  { id: "snsa", name: "Swedish National Space Agency", acronym: "SNSA", country: "Sweden", countryCode: "SE", website: "https://www.rymdstyrelsen.se", email: "info@rymdstyrelsen.se", region: "europe" },
  { id: "sso", name: "Swiss Space Office", acronym: "SSO", country: "Switzerland", countryCode: "CH", website: "https://www.sbfi.admin.ch", email: null, region: "europe" },
  { id: "ssau", name: "State Space Agency of Ukraine", acronym: "SSAU", country: "Ukraine", countryCode: "UA", website: "http://www.nkau.gov.ua", email: "yd@nkau.gov.ua", region: "europe" },
  { id: "armsa", name: "Armenia Space Agency", acronym: "ArmSA", country: "Armenia", countryCode: "AM", website: "https://www.sci.am", email: null, region: "europe" },
  { id: "scotsa", name: "Scottish Space Agency", acronym: "ScotSA", country: "Scotland", countryCode: "GB", website: "https://www.scotlandis.com/space", email: null, region: "europe" },
  { id: "irsa", name: "Iraqi Space Agency", acronym: "IrSA", country: "Iraq", countryCode: "IQ", website: "https://www.most.gov.iq", email: null, region: "middle_east" },
  { id: "jsrc", name: "Jordan Space Research Center", acronym: "JSRC", country: "Jordan", countryCode: "JO", website: "https://www.jsrc.gov.jo", email: null, region: "middle_east" },
  { id: "qsa", name: "Qatar Space Agency", acronym: "QSA", country: "Qatar", countryCode: "QA", website: "https://www.motc.gov.qa", email: null, region: "middle_east" },
  { id: "osp", name: "Oman Space Program", acronym: "OSP", country: "Oman", countryCode: "OM", website: "https://www.moci.gov.om", email: null, region: "middle_east" },
  { id: "kssc", name: "Kuwait Space Science Center", acronym: "KSSC", country: "Kuwait", countryCode: "KW", website: "https://www.kisr.edu.kw", email: "info@kisr.edu.kw", region: "middle_east" },
  { id: "egsa", name: "Egyptian Space Agency", acronym: "EgSA", country: "Egypt", countryCode: "EG", website: "https://egsa.gov.eg", email: "info@egsa.gov.eg", region: "africa" },
  { id: "gssti", name: "Ghana Space Science and Technology Institute", acronym: "GSSTI", country: "Ghana", countryCode: "GH", website: "https://www.gssti.org", email: "info@gssti.org", region: "africa" },
  { id: "ksa-ke", name: "Kenya Space Agency", acronym: "KSA", country: "Kenya", countryCode: "KE", website: "https://ksa.go.ke", email: "info@ksa.go.ke", region: "africa" },
  { id: "crts", name: "Royal Centre for Remote Sensing", acronym: "CRTS", country: "Morocco", countryCode: "MA", website: "https://www.crts.gov.ma", email: "info@crts.gov.ma", region: "africa" },
  { id: "nasrda", name: "National Space Research and Development Agency", acronym: "NASRDA", country: "Nigeria", countryCode: "NG", website: "https://nasrda.gov.ng", email: "info@nasrda.gov.ng", region: "africa" },
  { id: "rsa-rw", name: "Rwanda Space Agency", acronym: "RSA", country: "Rwanda", countryCode: "RW", website: "https://www.rsa.gov.rw", email: "info@rsa.gov.rw", region: "africa" },
  { id: "ssc", name: "Saudi Space Commission", acronym: "SSC", country: "Saudi Arabia", countryCode: "SA", website: "https://www.ssc.gov.sa", email: "ic@ssc.gov.sa", region: "middle_east" },
  { id: "sansa", name: "South African National Space Agency", acronym: "SANSA", country: "South Africa", countryCode: "ZA", website: "https://www.sansa.org.za", email: "information@sansa.org.za", region: "africa" },
  { id: "cnct", name: "National Centre for Cartography and Remote Sensing", acronym: "CNCT", country: "Tunisia", countryCode: "TN", website: "https://www.cnct.nat.tn", email: "info@cnct.nat.tn", region: "africa" },
  { id: "zingsa", name: "Zimbabwe National Geospatial and Space Agency", acronym: "ZINGSA", country: "Zimbabwe", countryCode: "ZW", website: "https://www.zingsa.ac.zw", email: "publicrelations@zingsa.ac.zw", region: "africa" },
  { id: "essti", name: "Ethiopia Space Science and Technology Institute", acronym: "ESSTI", country: "Ethiopia", countryCode: "ET", website: "https://essti.gov.et", email: "info@essti.gov.et", region: "africa" },
  { id: "anspo", name: "Angola National Space Program Office", acronym: "ANSPO", country: "Angola", countryCode: "AO", website: "https://www.angola.gov.ao", email: null, region: "africa" },
  { id: "biust-space", name: "Botswana International University of Science and Technology", acronym: "BIUST-Space", country: "Botswana", countryCode: "BW", website: "https://www.biust.ac.bw", email: "info@biust.ac.bw", region: "africa" },
  { id: "namsa", name: "Namibia Space Agency", acronym: "NamSA", country: "Namibia", countryCode: "NA", website: "https://www.mheti.gov.na", email: null, region: "africa" },
  { id: "tzsa", name: "Tanzania Space Agency", acronym: "TzSA", country: "Tanzania", countryCode: "TZ", website: "https://www.tcra.go.tz", email: null, region: "africa" },
  { id: "usp", name: "Uganda Space Program", acronym: "USP", country: "Uganda", countryCode: "UG", website: "https://www.ict.go.ug", email: null, region: "africa" },
  { id: "ssp", name: "Senegal Space Program", acronym: "SSP", country: "Senegal", countryCode: "SN", website: "https://www.numerique.gouv.sn", email: null, region: "africa" },
  { id: "icsp", name: "Ivory Coast Space Program", acronym: "ICSP", country: "Ivory Coast", countryCode: "CI", website: "https://www.gouv.ci", email: null, region: "africa" },
  { id: "apsco", name: "Asia-Pacific Space Cooperation Organization", acronym: "APSCO", country: "International", countryCode: "INTL", website: "http://www.apsco.int", email: "secretariat@apsco.int", region: "international" },
  { id: "euspa", name: "EU Agency for the Space Programme", acronym: "EUSPA", country: "European Union", countryCode: "EU", website: "https://www.euspa.europa.eu", email: "com@euspa.europa.eu", region: "europe" },
  { id: "armc", name: "African Resource Management Constellation", acronym: "ARMC", country: "Africa", countryCode: "AF", website: "https://www.armc.africa", email: null, region: "africa" },
  { id: "crectealc", name: "Latin American & Caribbean Space Conference", acronym: "CRECTEALC", country: "Latin America", countryCode: "LATAM", website: "https://crectealc.org", email: "secretaria@crectealc.org", region: "americas" },
  { id: "ascg", name: "Arab Space Coordination Group", acronym: "ASCG", country: "Arab League", countryCode: "ARAB", website: "https://www.arabspacecoordination.org", email: null, region: "middle_east" },
  { id: "casc", name: "China Aerospace Science and Technology Corporation", acronym: "CASC", country: "China", countryCode: "CN", website: "https://www.spacechina.com", email: null, region: "asia_pacific" },
  { id: "casic", name: "China Aerospace Science and Industry Corporation", acronym: "CASIC", country: "China", countryCode: "CN", website: "https://www.casic.cn", email: null, region: "asia_pacific" },
  { id: "nada", name: "National Aerospace Development Administration", acronym: "NADA", country: "North Korea", countryCode: "KP", website: "https://www.nada.kp", email: null, region: "asia_pacific" },
  { id: "isa-ie", name: "Irish Space Agency", acronym: "ISA-IE", country: "Ireland", countryCode: "IE", website: "https://www.enterprise-ireland.com/space", email: null, region: "europe" },
  { id: "bsa-bg", name: "Bulgarian Space Agency", acronym: "BSA-BG", country: "Bulgaria", countryCode: "BG", website: "https://www.srti-bas.org", email: null, region: "europe" },
  { id: "csa-hr", name: "Croatian Space Agency", acronym: "CSA-HR", country: "Croatia", countryCode: "HR", website: "https://www.fer.unizg.hr/zrsvn", email: null, region: "europe" },
  { id: "sso-si", name: "Slovenian Space Office", acronym: "SSO-SI", country: "Slovenia", countryCode: "SI", website: "https://www.mzi.gov.si", email: null, region: "europe" },
  { id: "sso-sk", name: "Slovak Space Office", acronym: "SSO-SK", country: "Slovakia", countryCode: "SK", website: "https://www.minedu.sk", email: null, region: "europe" },
  { id: "eso", name: "Estonian Space Office", acronym: "ESO", country: "Estonia", countryCode: "EE", website: "https://www.eas.ee", email: null, region: "europe" },
  { id: "lsia", name: "Latvian Space Industry Association", acronym: "LSIA", country: "Latvia", countryCode: "LV", website: "https://www.liaa.gov.lv", email: null, region: "europe" },
  { id: "lsa-lt", name: "Lithuanian Space Association", acronym: "LSA-LT", country: "Lithuania", countryCode: "LT", website: "https://www.space.lt", email: null, region: "europe" },
  { id: "mcst-space", name: "Malta Council for Science and Technology (Space)", acronym: "MCST-Space", country: "Malta", countryCode: "MT", website: "https://mcst.gov.mt", email: null, region: "europe" },
  { id: "cseo", name: "Cyprus Space Exploration Organisation", acronym: "CSEO", country: "Cyprus", countryCode: "CY", website: "https://www.cseo.org.cy", email: null, region: "europe" },
  { id: "isa-is", name: "Icelandic Space Agency", acronym: "ISA-IS", country: "Iceland", countryCode: "IS", website: "https://www.rannis.is", email: null, region: "europe" },
  { id: "mric-space", name: "Mauritius Research and Innovation Council (Space)", acronym: "MRIC-Space", country: "Mauritius", countryCode: "MU", website: "https://www.mric.mu", email: null, region: "africa" },
  { id: "zsa", name: "Zambia Space Agency", acronym: "ZSA", country: "Zambia", countryCode: "ZM", website: "https://www.mcti.gov.zm", email: null, region: "africa" },
  { id: "msp-mz", name: "Mozambique Space Program", acronym: "MSP-MZ", country: "Mozambique", countryCode: "MZ", website: "https://www.mct.gov.mz", email: null, region: "africa" },
  { id: "masp", name: "Madagascar Space Program", acronym: "MaSP", country: "Madagascar", countryCode: "MG", website: "https://www.mesupres.gov.mg", email: null, region: "africa" },
  { id: "camsp", name: "Cameroon Space Program", acronym: "CamSP", country: "Cameroon", countryCode: "CM", website: "https://www.minresi.cm", email: null, region: "africa" },
  { id: "drcsp", name: "DRC Space Program", acronym: "DRCSP", country: "Democratic Republic of Congo", countryCode: "CD", website: "https://www.gouvernement.cd", email: null, region: "africa" },
  { id: "ssa-sd", name: "Sudan Space Agency", acronym: "SSA-SD", country: "Sudan", countryCode: "SD", website: "https://www.isra.gov.sd", email: null, region: "africa" },
  { id: "lcrs", name: "Libyan Centre for Remote Sensing", acronym: "LCRS", country: "Libya", countryCode: "LY", website: "https://www.crtean.ly", email: null, region: "africa" },
  { id: "brsp", name: "Brunei Space Program", acronym: "BrSP", country: "Brunei", countryCode: "BN", website: "https://www.mof.gov.bn", email: null, region: "asia_pacific" },
  { id: "maldsp", name: "Maldives Space Program", acronym: "MaldSP", country: "Maldives", countryCode: "MV", website: "https://www.environment.gov.mv", email: null, region: "asia_pacific" },
  { id: "afsp", name: "Afghanistan Space Program", acronym: "AfSP", country: "Afghanistan", countryCode: "AF", website: "https://www.mcit.gov.af", email: null, region: "asia_pacific" },
  { id: "gsa-ge", name: "Georgian Space Agency", acronym: "GSA-GE", country: "Georgia", countryCode: "GE", website: "https://www.mes.gov.ge", email: null, region: "europe" },
  { id: "lesp", name: "Lebanese Space Program", acronym: "LeSP", country: "Lebanon", countryCode: "LB", website: "https://www.cnrs.edu.lb", email: null, region: "middle_east" },
  { id: "sysa", name: "Syrian Space Agency", acronym: "SySA", country: "Syria", countryCode: "SY", website: "https://www.gors.gov.sy", email: null, region: "middle_east" },
  { id: "ysp", name: "Yemen Space Program", acronym: "YSP", country: "Yemen", countryCode: "YE", website: "https://www.yemen.gov.ye", email: null, region: "middle_east" },
  { id: "tosp", name: "Tonga Space Program", acronym: "ToSP", country: "Tonga", countryCode: "TO", website: "https://www.gov.to", email: null, region: "asia_pacific" },
  { id: "sasp", name: "Samoa Space Program", acronym: "SaSP", country: "Samoa", countryCode: "WS", website: "https://www.samoagovt.ws", email: null, region: "asia_pacific" },
  { id: "vasp", name: "Vanuatu Space Program", acronym: "VaSP", country: "Vanuatu", countryCode: "VU", website: "https://www.gov.vu", email: null, region: "asia_pacific" },
  { id: "sisp", name: "Solomon Islands Space Program", acronym: "SISP", country: "Solomon Islands", countryCode: "SB", website: "https://www.solomons.gov.sb", email: null, region: "asia_pacific" },
  { id: "usp-uy", name: "Uruguay Space Program", acronym: "USP-UY", country: "Uruguay", countryCode: "UY", website: "https://www.anii.org.uy", email: null, region: "americas" },
  { id: "gsp-gy", name: "Guyana Space Program", acronym: "GSP-GY", country: "Guyana", countryCode: "GY", website: "https://www.education.gov.gy", email: null, region: "americas" },
  { id: "sursp", name: "Suriname Space Program", acronym: "SurSP", country: "Suriname", countryCode: "SR", website: "https://www.gov.sr", email: null, region: "americas" },
  { id: "honsp", name: "Honduras Space Program", acronym: "HonSP", country: "Honduras", countryCode: "HN", website: "https://www.ihcieti.gob.hn", email: null, region: "americas" },
  { id: "guasp", name: "Guatemala Space Program", acronym: "GuaSP", country: "Guatemala", countryCode: "GT", website: "https://www.senacyt.gob.gt", email: null, region: "americas" },
  { id: "elsp", name: "El Salvador Space Program", acronym: "ElSP", country: "El Salvador", countryCode: "SV", website: "https://www.mined.gob.sv", email: null, region: "americas" },
  { id: "nicsp", name: "Nicaragua Space Program", acronym: "NicSP", country: "Nicaragua", countryCode: "NI", website: "https://www.cnu.edu.ni", email: null, region: "americas" },
  { id: "domsp", name: "Dominican Space Program", acronym: "DomSP", country: "Dominican Republic", countryCode: "DO", website: "https://www.mescyt.gob.do", email: null, region: "americas" },
  { id: "prsp", name: "Puerto Rico Space Program", acronym: "PRSP", country: "Puerto Rico", countryCode: "PR", website: "https://www.ciencia.pr.gov", email: null, region: "americas" },
  { id: "bahsp", name: "Bahamas Space Program", acronym: "BahSP", country: "Bahamas", countryCode: "BS", website: "https://www.bahamas.gov.bs", email: null, region: "americas" },
  { id: "barsp", name: "Barbados Space Program", acronym: "BarSP", country: "Barbados", countryCode: "BB", website: "https://www.gov.bb", email: null, region: "americas" },
];

export const REGION_LABELS: Record<SpaceAgency["region"], string> = {
  americas: "Americas",
  europe: "Europe",
  asia_pacific: "Asia-Pacific",
  africa: "Africa",
  middle_east: "Middle East",
  international: "International",
};

export function getAgenciesByRegion(): Record<string, SpaceAgency[]> {
  const grouped: Record<string, SpaceAgency[]> = {};
  spaceAgencies.forEach(agency => {
    const region = REGION_LABELS[agency.region];
    if (!grouped[region]) grouped[region] = [];
    grouped[region].push(agency);
  });
  return grouped;
}

export function getAgenciesWithEmail(): SpaceAgency[] {
  return spaceAgencies.filter(a => a.email !== null);
}

export function searchAgencies(query: string): SpaceAgency[] {
  const lower = query.toLowerCase();
  return spaceAgencies.filter(a => 
    a.name.toLowerCase().includes(lower) ||
    a.acronym.toLowerCase().includes(lower) ||
    a.country.toLowerCase().includes(lower)
  );
}
