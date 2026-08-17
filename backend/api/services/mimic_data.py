"""
MIMIC (Multiple Indicators Multiple Causes) framework dataset & calculation engine.
Ported from Node.js to Python.
"""
from typing import Dict, Any, Optional, List

REGIONS = [
    {"id": "tashkent-city", "name": "Tashkent City", "shadowIndex": 31},
    {"id": "tashkent-region", "name": "Tashkent Region", "shadowIndex": 46},
    {"id": "andijan", "name": "Andijan Region", "shadowIndex": 57},
    {"id": "bukhara", "name": "Bukhara Region", "shadowIndex": 43},
    {"id": "fergana", "name": "Fergana Region", "shadowIndex": 60},
    {"id": "jizzakh", "name": "Jizzakh Region", "shadowIndex": 51},
    {"id": "namangan", "name": "Namangan Region", "shadowIndex": 56},
    {"id": "navoiy", "name": "Navoiy Region", "shadowIndex": 38},
    {"id": "qashqadaryo", "name": "Qashqadaryo Region", "shadowIndex": 65},
    {"id": "samarqand", "name": "Samarqand Region", "shadowIndex": 54},
    {"id": "sirdaryo", "name": "Sirdaryo Region", "shadowIndex": 48},
    {"id": "surxondaryo", "name": "Surxondaryo Region", "shadowIndex": 71},
    {"id": "xorazm", "name": "Xorazm Region", "shadowIndex": 52},
    {"id": "qoraqalpogiston", "name": "Republic of Karakalpakstan", "shadowIndex": 62},
]

MIMIC_CAUSES = [
    {
        "id": "direct-tax-burden",
        "category": "Tax Burden",
        "label": "Direct tax burden (income & corporate tax)",
        "unit": "% of GDP",
        "effect": "+",
        "range": [7, 16],
        "rationale": "Higher tax rates increase the financial incentive to hide income.",
    },
    {
        "id": "indirect-tax-burden",
        "category": "Tax Burden",
        "label": "Indirect tax burden (VAT, sales, excise)",
        "unit": "% of GDP",
        "effect": "+",
        "range": [8, 17],
        "rationale": "Pushes final retail and service transactions off the books.",
    },
    {
        "id": "social-security-contributions",
        "category": "Tax Burden",
        "label": "Social security contributions",
        "unit": "% of payroll",
        "effect": "+",
        "range": [14, 32],
        "rationale": "Drives informal cash-in-hand wage agreements (envelope wages).",
    },
    {
        "id": "labor-market-rigidity",
        "category": "Regulation & Institutions",
        "label": "Labor market rigidity index",
        "unit": "index, 0-100",
        "effect": "+",
        "range": [28, 72],
        "rationale": "Strict employment laws (hiring/firing costs, minimum wage) discourage formal contracting.",
    },
    {
        "id": "bureaucratic-burden",
        "category": "Regulation & Institutions",
        "label": "Bureaucratic burden",
        "unit": "index, 0-100 (higher = more burden)",
        "effect": "+",
        "range": [22, 68],
        "rationale": "Licensing delays and red tape create an incentive to operate unlisted.",
    },
    {
        "id": "corruption-control",
        "category": "Regulation & Institutions",
        "label": "Control of corruption & rule of law",
        "unit": "index, 0-100 (higher = stronger)",
        "effect": "-",
        "range": [30, 72],
        "rationale": "Strong institutions increase the risk and penalty of detection.",
    },
    {
        "id": "tax-morale",
        "category": "Regulation & Institutions",
        "label": "Tax morale / trust in government",
        "unit": "index, 0-100 (higher = more trust)",
        "effect": "-",
        "range": [28, 70],
        "rationale": "Higher public trust increases voluntary formal tax compliance.",
    },
    {
        "id": "unemployment-rate",
        "category": "Macro & Labor Conditions",
        "label": "Unemployment rate",
        "unit": "%",
        "effect": "+",
        "range": [4.5, 14],
        "rationale": "Unemployed individuals take informal jobs to replace lost earnings.",
    },
    {
        "id": "self-employment-rate",
        "category": "Macro & Labor Conditions",
        "label": "Self-employment rate",
        "unit": "% of workforce",
        "effect": "+",
        "range": [11, 31],
        "rationale": "Small sole proprietors have more opportunities to underreport income.",
    },
    {
        "id": "inflation-rate",
        "category": "Macro & Labor Conditions",
        "label": "Inflation rate",
        "unit": "%",
        "effect": "+",
        "range": [5.5, 14.5],
        "rationale": "High inflation erodes real earnings and formal financial stability.",
    },
    {
        "id": "gdp-per-capita",
        "category": "Macro & Labor Conditions",
        "label": "GDP per capita",
        "unit": "USD",
        "effect": "-",
        "range": [1700, 3600],
        "rationale": "Wealthier economies usually have stronger formal safety nets and formal jobs.",
    },
]

MIMIC_INDICATORS = [
    {
        "id": "currency-demand-ratio",
        "category": "Monetary Traces",
        "label": "Currency demand (cash M0 / M2 ratio)",
        "unit": "ratio",
        "effect": "+",
        "range": [0.14, 0.36],
        "rationale": "Shadow transactions rely primarily on physical, untraceable cash.",
    },
    {
        "id": "large-denomination-banknotes",
        "category": "Monetary Traces",
        "label": "Large-denomination banknotes in circulation",
        "unit": "% of currency in circulation",
        "effect": "+",
        "range": [28, 62],
        "rationale": "High-value cash notes are disproportionately hoarded for shadow deals.",
    },
    {
        "id": "electricity-consumption-index",
        "category": "Physical Input",
        "label": "Electricity consumption index",
        "unit": "index, 100 = expected from official GDP",
        "effect": "+",
        "range": [98, 136],
        "rationale": "Underground production still requires physical power, leaving a visible utility footprint.",
    },
    {
        "id": "labor-force-participation",
        "category": "Labor Market Traces",
        "label": "Official labor force participation rate",
        "unit": "%",
        "effect": "-",
        "range": [54, 76],
        "rationale": "People working informally drop out of formal labor statistics.",
    },
    {
        "id": "male-labor-force-participation",
        "category": "Labor Market Traces",
        "label": "Male labor force participation (ages 25-54)",
        "unit": "%",
        "effect": "-",
        "range": [74, 93],
        "rationale": "Prime-age workers disappearing from formal rolls are likely in the informal sector.",
    },
    {
        "id": "real-gdp-growth",
        "category": "National Output",
        "label": "Official real GDP growth rate",
        "unit": "%",
        "effect": "-",
        "range": [1.8, 6.5],
        "rationale": "Shadow activity diverts resources away from recorded official production.",
    },
]

def hash_string(value: str) -> int:
    hash_val = 0
    for char in value:
        hash_val = ((hash_val * 31) + ord(char)) & 0xFFFFFFFF
    return hash_val

def decimals_for_unit(unit: str) -> int:
    if unit == "ratio":
        return 2
    if unit == "USD":
        return 0
    if unit.startswith("index"):
        return 0
    return 1

def value_for_variable(region_id: str, region_index: float, variable: Dict[str, Any]) -> Any:
    min_val, max_val = variable["range"]
    normalized = region_index / 100.0
    span = max_val - min_val
    
    # Deterministic +/-6% jitter so values aren't perfectly linear against the index
    jitter = (((hash_string(f"{region_id}:{variable['id']}") % 100) / 100.0) - 0.5) * 0.12 * span
    base = min_val + normalized * span if variable["effect"] == "+" else max_val - normalized * span
    val = min(max_val, max(min_val, base + jitter))
    decimals = decimals_for_unit(variable["unit"])
    if decimals == 0:
        return int(round(val))
    return round(val, decimals)

def get_region(region_id: str) -> Optional[Dict[str, Any]]:
    for region in REGIONS:
        if region["id"] == region_id:
            return region
    return None

def get_region_mimic_data(region_id: str) -> Optional[Dict[str, Any]]:
    region = get_region(region_id)
    if not region:
        return None
    
    causes = [
        {
            **var,
            "value": value_for_variable(region_id, region["shadowIndex"], var),
        }
        for var in MIMIC_CAUSES
    ]
    
    indicators = [
        {
            **var,
            "value": value_for_variable(region_id, region["shadowIndex"], var),
        }
        for var in MIMIC_INDICATORS
    ]
    
    return {
        "region": region,
        "causes": causes,
        "indicators": indicators,
    }

def get_all_regions_mimic_data() -> List[Dict[str, Any]]:
    return [get_region_mimic_data(region["id"]) for region in REGIONS]
