// Fallback Nasdaq 100 list - comprehensive list of Nasdaq 100 companies
// Updated for 2025 to include current Nasdaq 100 constituents
export const NASDAQ100_FALLBACK = [
    // Technology - Large Cap
    { Symbol: "AAPL", Name: "Apple Inc", Sector: "Technology" },
    { Symbol: "MSFT", Name: "Microsoft Corporation", Sector: "Technology" },
    { Symbol: "GOOGL", Name: "Alphabet Inc Class A", Sector: "Technology" },
    { Symbol: "GOOG", Name: "Alphabet Inc Class C", Sector: "Technology" },
    { Symbol: "AMZN", Name: "Amazon.com Inc", Sector: "Consumer Discretionary" },
    { Symbol: "META", Name: "Meta Platforms Inc", Sector: "Technology" },
    { Symbol: "TSLA", Name: "Tesla Inc", Sector: "Consumer Discretionary" },
    { Symbol: "NVDA", Name: "NVIDIA Corporation", Sector: "Technology" },
    { Symbol: "NFLX", Name: "Netflix Inc", Sector: "Communication Services" },

    // Technology - Software & Services
    { Symbol: "CRM", Name: "Salesforce Inc", Sector: "Technology" },
    { Symbol: "ORCL", Name: "Oracle Corporation", Sector: "Technology" },
    { Symbol: "ADBE", Name: "Adobe Inc", Sector: "Technology" },
    { Symbol: "AMD", Name: "Advanced Micro Devices Inc", Sector: "Technology" },
    { Symbol: "INTC", Name: "Intel Corporation", Sector: "Technology" },
    { Symbol: "CSCO", Name: "Cisco Systems Inc", Sector: "Technology" },
    { Symbol: "QCOM", Name: "QUALCOMM Incorporated", Sector: "Technology" },
    { Symbol: "NOW", Name: "ServiceNow Inc", Sector: "Technology" },
    { Symbol: "INTU", Name: "Intuit Inc", Sector: "Technology" },
    { Symbol: "TXN", Name: "Texas Instruments Incorporated", Sector: "Technology" },
    { Symbol: "AMAT", Name: "Applied Materials Inc", Sector: "Technology" },

    // Technology - Semiconductors
    { Symbol: "AVGO", Name: "Broadcom Inc", Sector: "Technology" },
    { Symbol: "MU", Name: "Micron Technology Inc", Sector: "Technology" },
    { Symbol: "ADI", Name: "Analog Devices Inc", Sector: "Technology" },
    { Symbol: "MRVL", Name: "Marvell Technology Inc", Sector: "Technology" },
    { Symbol: "KLAC", Name: "KLA Corporation", Sector: "Technology" },
    { Symbol: "LRCX", Name: "Lam Research Corporation", Sector: "Technology" },
    { Symbol: "SNPS", Name: "Synopsys Inc", Sector: "Technology" },
    { Symbol: "CDNS", Name: "Cadence Design Systems Inc", Sector: "Technology" },

    // Technology - Software
    { Symbol: "TEAM", Name: "Atlassian Corporation", Sector: "Technology" },
    { Symbol: "WDAY", Name: "Workday Inc", Sector: "Technology" },
    { Symbol: "PANW", Name: "Palo Alto Networks Inc", Sector: "Technology" },
    { Symbol: "CRWD", Name: "CrowdStrike Holdings Inc", Sector: "Technology" },
    { Symbol: "FTNT", Name: "Fortinet Inc", Sector: "Technology" },
    { Symbol: "DDOG", Name: "Datadog Inc", Sector: "Technology" },
    { Symbol: "ZS", Name: "Zscaler Inc", Sector: "Technology" },
    { Symbol: "OKTA", Name: "Okta Inc", Sector: "Technology" },

    // Communication Services (duplicates removed - already listed above)
    { Symbol: "CMCSA", Name: "Comcast Corporation", Sector: "Communication Services" },
    { Symbol: "DISH", Name: "DISH Network Corporation", Sector: "Communication Services" },

    // Consumer Discretionary (AMZN and TSLA already listed above)
    { Symbol: "SBUX", Name: "Starbucks Corporation", Sector: "Consumer Discretionary" },
    { Symbol: "BKNG", Name: "Booking Holdings Inc", Sector: "Consumer Discretionary" },
    { Symbol: "MDB", Name: "MongoDB Inc", Sector: "Consumer Discretionary" },
    { Symbol: "ABNB", Name: "Airbnb Inc", Sector: "Consumer Discretionary" },
    { Symbol: "EBAY", Name: "eBay Inc", Sector: "Consumer Discretionary" },
    { Symbol: "JD", Name: "JD.com Inc", Sector: "Consumer Discretionary" },
    { Symbol: "PDD", Name: "PDD Holdings Inc", Sector: "Consumer Discretionary" },

    // Consumer Staples
    { Symbol: "COST", Name: "Costco Wholesale Corporation", Sector: "Consumer Staples" },
    { Symbol: "KHC", Name: "The Kraft Heinz Company", Sector: "Consumer Staples" },
    { Symbol: "MDLZ", Name: "Mondelez International Inc", Sector: "Consumer Staples" },
    { Symbol: "PEP", Name: "PepsiCo Inc", Sector: "Consumer Staples" },

    // Healthcare & Biotechnology
    { Symbol: "GILD", Name: "Gilead Sciences Inc", Sector: "Healthcare" },
    { Symbol: "AMGN", Name: "Amgen Inc", Sector: "Healthcare" },
    { Symbol: "BIIB", Name: "Biogen Inc", Sector: "Healthcare" },
    { Symbol: "REGN", Name: "Regeneron Pharmaceuticals Inc", Sector: "Healthcare" },
    { Symbol: "VRTX", Name: "Vertex Pharmaceuticals Incorporated", Sector: "Healthcare" },
    { Symbol: "ILMN", Name: "Illumina Inc", Sector: "Healthcare" },
    { Symbol: "MRNA", Name: "Moderna Inc", Sector: "Healthcare" },
    { Symbol: "SGEN", Name: "Seagen Inc", Sector: "Healthcare" },

    // Industrials
    { Symbol: "HON", Name: "Honeywell International Inc", Sector: "Industrials" },
    { Symbol: "ADP", Name: "Automatic Data Processing Inc", Sector: "Industrials" },
    { Symbol: "PAYX", Name: "Paychex Inc", Sector: "Industrials" },

    // Financials
    { Symbol: "PYPL", Name: "PayPal Holdings Inc", Sector: "Financials" },
    { Symbol: "NDAQ", Name: "Nasdaq Inc", Sector: "Financials" },

    // Energy
    { Symbol: "XEL", Name: "Xcel Energy Inc", Sector: "Energy" },

    // Utilities
    { Symbol: "EXC", Name: "Exelon Corporation", Sector: "Utilities" },

    // Real Estate Investment Trusts
    { Symbol: "DLTR", Name: "Dollar Tree Inc", Sector: "Consumer Discretionary" },

    // Additional Technology Companies
    { Symbol: "ZOOM", Name: "Zoom Video Communications Inc", Sector: "Technology" },
    { Symbol: "DOCU", Name: "DocuSign Inc", Sector: "Technology" },
    { Symbol: "SPLK", Name: "Splunk Inc", Sector: "Technology" },
    { Symbol: "NTNX", Name: "Nutanix Inc", Sector: "Technology" },
    { Symbol: "VEEV", Name: "Veeva Systems Inc", Sector: "Technology" },
    { Symbol: "ALGN", Name: "Align Technology Inc", Sector: "Healthcare" },

    // Biotech & Pharmaceuticals
    { Symbol: "BMRN", Name: "BioMarin Pharmaceutical Inc", Sector: "Healthcare" },
    { Symbol: "ALXN", Name: "Alexion Pharmaceuticals Inc", Sector: "Healthcare" },
    { Symbol: "INCY", Name: "Incyte Corporation", Sector: "Healthcare" },

    // Retail & E-commerce
    { Symbol: "WBA", Name: "Walgreens Boots Alliance Inc", Sector: "Consumer Staples" },
    { Symbol: "ROST", Name: "Ross Stores Inc", Sector: "Consumer Discretionary" },
    { Symbol: "LULU", Name: "Lululemon Athletica Inc", Sector: "Consumer Discretionary" },

    // Semiconductors & Hardware
    { Symbol: "MCHP", Name: "Microchip Technology Incorporated", Sector: "Technology" },
    { Symbol: "SWKS", Name: "Skyworks Solutions Inc", Sector: "Technology" },
    { Symbol: "QRVO", Name: "Qorvo Inc", Sector: "Technology" },

    // Media & Entertainment
    { Symbol: "EA", Name: "Electronic Arts Inc", Sector: "Communication Services" },
    { Symbol: "ATVI", Name: "Activision Blizzard Inc", Sector: "Communication Services" },
    { Symbol: "NTES", Name: "NetEase Inc", Sector: "Communication Services" },

    // Transportation & Logistics
    { Symbol: "FAST", Name: "Fastenal Company", Sector: "Industrials" },

    // Additional Companies (to reach approximately 100)
    { Symbol: "FISV", Name: "Fiserv Inc", Sector: "Technology" },
    { Symbol: "ISRG", Name: "Intuitive Surgical Inc", Sector: "Healthcare" },
    { Symbol: "CSX", Name: "CSX Corporation", Sector: "Industrials" },
    { Symbol: "TMUS", Name: "T-Mobile US Inc", Sector: "Communication Services" },
    { Symbol: "CHTR", Name: "Charter Communications Inc", Sector: "Communication Services" },
    { Symbol: "CPRT", Name: "Copart Inc", Sector: "Industrials" },
    { Symbol: "CTAS", Name: "Cintas Corporation", Sector: "Industrials" },
    { Symbol: "VRSK", Name: "Verisk Analytics Inc", Sector: "Industrials" },
    { Symbol: "IDXX", Name: "IDEXX Laboratories Inc", Sector: "Healthcare" },
    { Symbol: "ANSS", Name: "ANSYS Inc", Sector: "Technology" },
    { Symbol: "CTSH", Name: "Cognizant Technology Solutions Corporation", Sector: "Technology" },
    { Symbol: "MELI", Name: "MercadoLibre Inc", Sector: "Consumer Discretionary" },
    { Symbol: "ODFL", Name: "Old Dominion Freight Line Inc", Sector: "Industrials" },
    { Symbol: "PCAR", Name: "PACCAR Inc", Sector: "Industrials" },
    { Symbol: "SIRI", Name: "Sirius XM Holdings Inc", Sector: "Communication Services" },
    { Symbol: "WDC", Name: "Western Digital Corporation", Sector: "Technology" },
    { Symbol: "XLNX", Name: "Xilinx Inc", Sector: "Technology" },
];
