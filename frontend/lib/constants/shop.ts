export const COUNTRY_CODES = `
AD AE AF AG AI AL AM AO AQ AR AS AT AU AW AX AZ
BA BB BD BE BF BG BH BI BJ BL BM BN BO BQ BR BS BT BV BW BY BZ
CA CC CD CF CG CH CI CK CL CM CN CO CR CU CV CW CX CY CZ
DE DJ DK DM DO DZ
EC EE EG EH ER ES ET
FI FJ FK FM FO FR
GA GB GD GE GF GG GH GI GL GM GN GP GQ GR GS GT GU GW GY
HK HM HN HR HT HU
ID IE IL IM IN IO IQ IR IS IT
JE JM JO JP
KE KG KH KI KM KN KP KR KW KY KZ
LA LB LC LI LK LR LS LT LU LV LY
MA MC MD ME MF MG MH MK ML MM MN MO MP MQ MR MS MT MU MV MW MX MY MZ
NA NC NE NF NG NI NL NO NP NR NU NZ
OM
PA PE PF PG PH PK PL PM PN PR PS PT PW PY
QA
RE RO RS RU RW
SA SB SC SD SE SG SH SI SJ SK SL SM SN SO SR SS ST SV SX SY SZ
TC TD TF TG TH TJ TK TL TM TN TO TR TT TV TW TZ
UA UG UM US UY UZ
VA VC VE VG VI VN VU
WF WS
YE YT
ZA ZM ZW
`
  .trim()
  .split(/\s+/);

export const COMMON_CURRENCIES = ["USD", "EUR", "ARS"];

const RAW_CURRENCY_OPTIONS = `
AED - United Arab Emirates Dirham
AFN - Afghan Afghani
ALL - Albanian Lek
AMD - Armenian Dram
ANG - Netherlands Antillean Guilder
AOA - Angolan Kwanza
ARS - Argentine Peso
AUD - Australian Dollar
AWG - Aruban Florin
AZN - Azerbaijani Manat
BAM - Bosnia and Herzegovina Convertible Mark
BBD - Barbados Dollar
BDT - Bangladeshi Taka
BGN - Bulgarian Lev
BHD - Bahraini Dinar
BIF - Burundian Franc
BMD - Bermudan Dollar
BND - Brunei Dollar
BOB - Boliviano
BOV - Bolivian Mvdol
BRL - Brazilian Real
BSD - Bahamian Dollar
BTN - Bhutanese Ngultrum
BWP - Botswanan Pula
BYN - Belarusian Ruble
BZD - Belize Dollar
CAD - Canadian Dollar
CDF - Congolese Franc
CHE - WIR Euro
CHF - Swiss Franc
CHW - WIR Franc
CLF - Unidad de Fomento
CLP - Chilean Peso
CNY - Chinese Yuan
COP - Colombian Peso
COU - Unidad de Valor Real
CRC - Costa Rican Colon
CUC - Cuban Convertible Peso
CUP - Cuban Peso
CVE - Cape Verdean Escudo
CZK - Czech Koruna
DJF - Djiboutian Franc
DKK - Danish Krone
DOP - Dominican Peso
DZD - Algerian Dinar
EGP - Egyptian Pound
ERN - Eritrean Nakfa
ETB - Ethiopian Birr
EUR - Euro
FJD - Fijian Dollar
FKP - Falkland Islands Pound
GBP - Pound Sterling
GEL - Georgian Lari
GHS - Ghanaian Cedi
GIP - Gibraltar Pound
GMD - Gambian Dalasi
GNF - Guinean Franc
GTQ - Guatemalan Quetzal
GYD - Guyanese Dollar
HKD - Hong Kong Dollar
HNL - Honduran Lempira
HTG - Haitian Gourde
HUF - Hungarian Forint
IDR - Indonesian Rupiah
ILS - Israeli New Shekel
INR - Indian Rupee
IQD - Iraqi Dinar
IRR - Iranian Rial
ISK - Icelandic Krona
JMD - Jamaican Dollar
JOD - Jordanian Dinar
JPY - Japanese Yen
KES - Kenyan Shilling
KGS - Kyrgystani Som
KHR - Cambodian Riel
KMF - Comorian Franc
KPW - North Korean Won
KRW - South Korean Won
KWD - Kuwaiti Dinar
KYD - Cayman Islands Dollar
KZT - Kazakhstani Tenge
LAK - Laotian Kip
LBP - Lebanese Pound
LKR - Sri Lankan Rupee
LRD - Liberian Dollar
LSL - Lesotho Loti
LYD - Libyan Dinar
MAD - Moroccan Dirham
MDL - Moldovan Leu
MGA - Malagasy Ariary
MKD - Macedonian Denar
MMK - Myanma Kyat
MNT - Mongolian Tugrik
MOP - Macanese Pataca
MRU - Mauritanian Ouguiya
MUR - Mauritian Rupee
MVR - Maldivian Rufiyaa
MWK - Malawian Kwacha
MXN - Mexican Peso
MXV - Mexican Unidad de Inversion (UDI)
MYR - Malaysian Ringgit
MZN - Mozambican Metical
NAD - Namibian Dollar
NGN - Nigerian Naira
NIO - Nicaraguan Cordoba
NOK - Norwegian Krone
NPR - Nepalese Rupee
NZD - New Zealand Dollar
OMR - Omani Rial
PAB - Panamanian Balboa
PEN - Peruvian Sol
PGK - Papua New Guinean Kina
PHP - Philippine Peso
PKR - Pakistani Rupee
PLN - Polish Zloty
PYG - Paraguayan Guarani
QAR - Qatari Rial
RON - Romanian Leu
RSD - Serbian Dinar
RUB - Russian Ruble
RWF - Rwandan Franc
SAR - Saudi Riyal
SBD - Solomon Islands Dollar
SCR - Seychellois Rupee
SDG - Sudanese Pound
SEK - Swedish Krona
SGD - Singapore Dollar
SHP - Saint Helena Pound
SLE - Sierra Leonean Leone
SOS - Somali Shilling
SRD - Surinamese Dollar
SSP - South Sudanese Pound
STN - Sao Tome and Principe Dobra
SVC - Salvadoran Colon
SYP - Syrian Pound
SZL - Swazi Lilangeni
THB - Thai Baht
TJS - Tajikistani Somoni
TMT - Turkmenistani Manat
TND - Tunisian Dinar
TOP - Tongan Paanga
TRY - Turkish Lira
TTD - Trinidad and Tobago Dollar
TWD - New Taiwan Dollar
TZS - Tanzanian Shilling
UAH - Ukrainian Hryvnia
UGX - Ugandan Shilling
USD - US Dollar
USN - US Dollar (Next day)
UYI - Uruguay Peso en Unidades Indexadas
UYU - Uruguayan Peso
UYW - Unidad Previsional
UZS - Uzbekistan Som
VES - Venezuelan Bolivar Soberano
VND - Vietnamese Dong
VUV - Vanuatu Vatu
WST - Samoan Tala
XAF - CFA Franc BEAC
XAG - Silver (troy ounce)
XAU - Gold (troy ounce)
XBA - European Composite Unit
XBB - European Monetary Unit
XBC - European Unit of Account 9
XBD - European Unit of Account 17
XCD - East Caribbean Dollar
XDR - Special Drawing Rights
XOF - CFA Franc BCEAO
XPD - Palladium (troy ounce)
XPF - CFP Franc
XPT - Platinum (troy ounce)
XSU - Sucre
XTS - Codes specifically reserved for testing
XUA - ADB Unit of Account
XXX - No currency
YER - Yemeni Rial
ZAR - South African Rand
ZMW - Zambian Kwacha
ZWL - Zimbabwean Dollar
`
  .trim()
  .split("\n");

export const CURRENCY_OPTIONS = RAW_CURRENCY_OPTIONS.map((line) => {
  const [code, ...nameParts] = line.split(/\s-\s| – /);
  return {
    code: code.trim(),
    label: nameParts.join(" - ").trim(),
  };
});

const COMMON_CURRENCY_SET = new Set(COMMON_CURRENCIES);

const COMMON_CURRENCY_OPTIONS = COMMON_CURRENCIES.map((code) =>
  CURRENCY_OPTIONS.find((currency) => currency.code === code)
).filter(Boolean) as { code: string; label: string }[];

export const ORDERED_CURRENCY_OPTIONS = [
  ...COMMON_CURRENCY_OPTIONS,
  ...CURRENCY_OPTIONS.filter((currency) => !COMMON_CURRENCY_SET.has(currency.code)),
];

export const DEFAULT_COUNTRY_CODE = "AR";
export const DEFAULT_CURRENCY_CODE = "USD";
