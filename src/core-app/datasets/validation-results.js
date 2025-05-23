export default {
  filename: 'filename/goes/here.txt',
  delimiter: ',',
  nrows: 100,
  header: [
    'ClientNumber',
    'ReportNumber',
    'IMSID',
    'IsTarget',
    'SpecialtyCode',
    'SpecialtyName',
    'SRA3',
    'PlanID',
    'PlanName',
    'PayerName',
    'Model',
    'PBMName',
    'Category',
    'ProductGroupNumber',
    'ProductGroupName',
    'MENumber',
    'LastName',
    'FirstName',
    'MiddleInitial',
    'Street',
    'City',
    'State',
    'ZipCode',
    'TerritoryID',
    'TerritoryName',
    'RegionID',
    'RegionName',
    'AreaID',
    'AreaName',
    'SalesLastName',
    'SalesFirstName',
    'SalesEmail',
    'NPI',
    'DataDate',
    'Date',
    'TRx',
    'NRx',
    'Tqty',
    'Nqty',
    'PDRPlist',
    'ProductGroupName_PDRP',
  ],
  hash: 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
  fields: [
    {
      idx: 0,
      nlevels: 2,
      surjections: [12],
      isomorphisms: [1, 33, 3, 39, 12],
      purpose: 'mcomp',
      levels: ['825', '826'],
    },
    {
      idx: 1,
      nlevels: 1,
      surjections: [],
      isomorphisms: [0, 33, 3, 39, 12],
      purpose: 'quality',
      levels: ['1'],
    },
    {
      idx: 2,
      nlevels: 296021,
      surjections: [
        0,
        1,
        3,
        4,
        5,
        6,
        12,
        15,
        16,
        17,
        18,
        19,
        20,
        21,
        22,
        23,
        24,
        25,
        26,
        27,
        28,
        29,
        30,
        31,
        32,
        33,
        39,
      ],
      isomorphisms: [32, 15],
      purpose: 'subject',
      levels: [
        '0000381',
        '0000663',
        '0000880',
        '0000954',
        '0001012',
        '0001916',
        '0001953',
        '0002003',
        '0003187',
        '0004339',
      ],
    },
    {
      idx: 3,
      nlevels: 3,
      surjections: [1, 33, 39],
      isomorphisms: [0, 33, 1, 39, 12],
      purpose: 'quality',
      levels: ['Y', '', 'NULL'],
    },
    {
      idx: 4,
      nlevels: 314,
      surjections: [1, 33, 3, 5, 39],
      isomorphisms: [5],
      purpose: 'quality',
      levels: [
        '01OBG',
        '01U',
        '01IM',
        '01FM',
        '01GYN',
        '01GO',
        '01OPH',
        '01GP',
        '06NRP',
        '01EM',
      ],
    },
    {
      idx: 5,
      nlevels: 312,
      surjections: [1, 33, 3, 39],
      isomorphisms: [4],
      purpose: 'quality',
      levels: [
        'OBSTETRICS & GYNECOLOGY Medical Doctors',
        'UROLOGY Medical Doctors',
        'INTERNAL MEDICINE Medical Doctors',
        'FAMILY MEDICINE Medical Doctors',
        'GYNECOLOGY Medical Doctors',
        'GYNECOLOGICAL ONCOLOGY Medical Doctors',
        'OPHTHALMOLOGY Medical Doctors',
        'GENERAL PRACTICE Medical Doctors',
        'NURSE PRACTITIONER Nurse',
        'EMERGENCY MEDICINE Medical Doctors',
      ],
    },
    {
      idx: 6,
      nlevels: 16201,
      surjections: [1, 33, 3, 39],
      isomorphisms: [],
      purpose: 'quality',
      levels: [
        '36207',
        '35205',
        '36608',
        '35243',
        '37917',
        '71603',
        '72335',
        '72117',
        '90012',
        '97216',
      ],
    },
    {
      idx: 7,
      nlevels: 7854,
      surjections: [0, 9, 10, 11, 12],
      isomorphisms: [8],
      purpose: 'mvalue',
      levels: [
        '0000120337',
        '0011640001',
        '0011640002',
        '0000200084',
        '7000830001',
        '0000120339',
        '0020400107',
        '0005819999',
        '0020400109',
        '0002890015',
      ],
    },
    {
      idx: 8,
      nlevels: 7854,
      surjections: [0, 7, 9, 10, 11, 12],
      isomorphisms: [7],
      purpose: 'mcomp',
      levels: [
        'HUMANA MED D GENERAL(AL)',
        'PREFERRED CARE PPO (AL)',
        'ALABAMA PERSONAL CHOICE (AL)',
        'UNITED HLTHCARE-(AL) AL PPO',
        'CHANGE HEALTHCARE (PROC-UNSP)',
        'HUMANA MED D GENERAL(AR)',
        'SILVERSCRIPT MED PDP GENERAL(AR)',
        'MAIL ORDER DATA UNSPEC',
        'SILVERSCRIPT MED PDP GENERAL(CA)',
        'PROVIDENCE MED XTRA GENERAL (OR)',
      ],
    },
    {
      idx: 9,
      nlevels: 1910,
      surjections: [0, 12],
      isomorphisms: [],
      purpose: 'mcomp',
      levels: [
        'HUMANA',
        'BCBS ALABAMA (AL)',
        'UNITED HEALTHCARE',
        'CHANGE HEALTHCARE UNSPEC',
        'SILVERSCRIPT',
        'MAIL ORDER DATA',
        'PROVIDENCE HEALTH SYSTEMS',
        'EXPRESS SCRIPTS UNSPEC',
        'LONG BEACH UNIFIED SCH DIST (CA)',
        'CIGNA',
      ],
    },
    {
      idx: 10,
      nlevels: 51,
      surjections: [0, 12],
      isomorphisms: [],
      purpose: 'mcomp',
      levels: [
        'MED UNSP',
        'PPO',
        'NETWORK',
        'PBM',
        'MED PDPG',
        'UNSPEC',
        'MED ADVG',
        'IPA',
        'EMPLOYER',
        'PBM BOB',
      ],
    },
    {
      idx: 11,
      nlevels: 86,
      surjections: [0, 12],
      isomorphisms: [],
      purpose: 'mcomp',
      levels: [
        'Dst Pharm Solutions',
        'Prime Therapeutics',
        'Optumrx',
        'Change Healthcare',
        'Caremark',
        'N/A',
        'Express Scripts',
        'Aetna Pharmacy Mgt',
        'Medimpact/Medcare',
        'Navitus Hlth Solutns',
      ],
    },
    {
      idx: 12,
      nlevels: 2,
      surjections: [],
      isomorphisms: [0, 33, 1, 3, 39],
      purpose: 'mvalue',
      levels: ['01', '02'],
    },
    {
      idx: 13,
      nlevels: 15,
      surjections: [33, 1, 3, 39, 40, 14],
      isomorphisms: [14],
      purpose: 'quality',
      levels: [
        '000000053',
        '000000158',
        '000000090',
        '000000175',
        '000000146',
        '000000187',
        '000000271',
        '000000270',
        '000000268',
        '000000272',
      ],
    },
    {
      idx: 14,
      nlevels: 15,
      surjections: [1, 33, 3, 39, 40],
      isomorphisms: [13],
      purpose: 'quality',
      levels: [
        'ESTRACE CRM VAG 0.01%',
        'PREMARIN VAG CRM W/APP ..625MG',
        'ESTRING VAG RING 2MG',
        'VAGIFEM TAB VAG 10MCG',
        'OSPHENA TAB FC 60MG',
        'YUVAFEM TAB VAG 10MCG',
        'Estradiol, Cream Vag, 0.01% Mylan',
        'ESTRADIOL TAB VAG 10MCG',
        'INTRAROSA INSERT VAG 6.5MG',
        'Estradiol, Cream Vag, 0.01% Teva',
      ],
    },
    {
      idx: 15,
      nlevels: 295989,
      surjections: [
        1,
        3,
        4,
        5,
        6,
        16,
        17,
        18,
        19,
        20,
        21,
        22,
        23,
        24,
        25,
        26,
        27,
        28,
        29,
        30,
        31,
        32,
        33,
        39,
      ],
      isomorphisms: [32, 2],
      purpose: 'quality',
      levels: [
        '0010261063',
        '0010272067',
        '0010278112',
        '0010281016',
        '0010677061',
        '0040176045',
        '0040178037',
        '0040181025',
        '0050676082',
        '0051266070',
      ],
    },
    {
      idx: 16,
      nlevels: 100137,
      surjections: [33, 1, 3, 39],
      isomorphisms: [],
      purpose: 'quality',
      levels: [
        'STEWART',
        'ORSO',
        'URQUHART',
        'BROCK',
        'TRAYLOR',
        'JACKS',
        'DEROSSITT',
        'CHANG',
        'QUON',
        'PETERSEN',
      ],
    },
    {
      idx: 17,
      nlevels: 29533,
      surjections: [1, 33, 3, 39],
      isomorphisms: [],
      purpose: 'quality',
      levels: [
        'JAMES',
        'RONALD',
        'WILLIAM',
        'THOMAS',
        'DAVID',
        'JIMMY',
        'HEW',
        'ARNOLD',
        'LOVERA',
        'CALVIN',
      ],
    },
    {
      idx: 18,
      nlevels: 27,
      surjections: [33, 1, 3, 39],
      isomorphisms: [],
      purpose: 'quality',
      levels: ['P', 'W', 'J', 'C', 'R', '', 'L', 'D', 'N', 'H'],
    },
    {
      idx: 19,
      nlevels: 90929,
      surjections: [1, 33, 3, 39, 27, 28],
      isomorphisms: [],
      purpose: 'quality',
      levels: [
        '901 LEIGHTON AVE',
        '800 SAINT VINCENTS DR',
        '3715 DAUPHIN ST',
        '3686 GRANDVIEW PKWY',
        '939 EMERALD AVE',
        '1600 W 40TH AVE',
        '902 HOLIDAY DR',
        '3343 SPRINGHILL DR',
        '808 N HILL ST',
        '10101 SE MAIN ST',
      ],
    },
    {
      idx: 20,
      nlevels: 8860,
      surjections: [33, 1, 3, 39],
      isomorphisms: [],
      purpose: 'quality',
      levels: [
        'ANNISTON',
        'BIRMINGHAM',
        'MOBILE',
        'KNOXVILLE',
        'PINE BLUFF',
        'FORREST CITY',
        'NORTH LITTLE ROCK',
        'LOS ANGELES',
        'PORTLAND',
        'MICHIGAN CITY',
      ],
    },
    {
      idx: 21,
      nlevels: 58,
      surjections: [33, 1, 3, 39, 27, 28],
      isomorphisms: [],
      purpose: 'quality',
      levels: ['AL', 'TN', 'AR', 'CA', 'OR', 'IN', 'WI', 'NV', 'FL', 'CO'],
    },
    {
      idx: 22,
      nlevels: 16190,
      surjections: [33, 1, 3, 39, 21, 23, 24, 25, 26, 27, 28, 29, 30, 31],
      isomorphisms: [],
      purpose: 'quality',
      levels: [
        '36207',
        '35205',
        '36608',
        '35243',
        '37917',
        '71603',
        '72335',
        '72117',
        '90012',
        '97216',
      ],
    },
    {
      idx: 23,
      nlevels: 137,
      surjections: [33, 1, 3, 39, 25, 26, 27, 28, 29, 30, 31],
      isomorphisms: [24],
      purpose: 'quality',
      levels: [
        'T0081',
        'T0076',
        'T0082',
        'T0070',
        'T0084',
        'T0121',
        'T0133',
        'T0048',
        'WXXXXX',
        'T0124',
      ],
    },
    {
      idx: 24,
      nlevels: 137,
      surjections: [1, 33, 3, 39, 23, 25, 26, 27, 28, 29, 30, 31],
      isomorphisms: [23],
      purpose: 'quality',
      levels: [
        'Birmingham N, AL',
        'Mobile, AL',
        'Birmingham S, AL',
        'Knoxville, TN',
        'Little Rock, AR',
        'Santa Clarita, CA',
        'Portland, OR',
        'South Bend, IN',
        'Whitespace',
        'Las Vegas, NV',
      ],
    },
    {
      idx: 25,
      nlevels: 19,
      surjections: [1, 33, 3, 39, 26, 27, 28],
      isomorphisms: [26],
      purpose: 'quality',
      levels: [
        'R12',
        'R11',
        'R13',
        'R15',
        'R17',
        'R08',
        'WXXX',
        'R16',
        'R07',
        'R01',
      ],
    },
    {
      idx: 26,
      nlevels: 19,
      surjections: [1, 33, 3, 39, 27, 28],
      isomorphisms: [25],
      purpose: 'quality',
      levels: [
        'Gulf States',
        'NC/TN',
        'North Texas/OK',
        'Southern California',
        'Pacific NW',
        'Great Lakes',
        'Whitespace',
        'Southwest',
        'Florida',
        'Boston',
      ],
    },
    {
      idx: 27,
      nlevels: 6,
      surjections: [1, 33, 3, 39],
      isomorphisms: [28],
      purpose: 'quality',
      levels: ['A04', 'A02', 'A03', 'A01', 'WX', '#N/A'],
    },
    {
      idx: 28,
      nlevels: 6,
      surjections: [1, 33, 3, 39, 27],
      isomorphisms: [27],
      purpose: 'quality',
      levels: [
        'Central',
        'Southeast',
        'West',
        'Northeast',
        'Whitespace',
        '#N/A',
      ],
    },
    {
      idx: 29,
      nlevels: 130,
      surjections: [1, 33, 3, 39, 30, 31],
      isomorphisms: [30, 31],
      purpose: 'quality',
      levels: [
        'Wood',
        'Lord',
        'Jackson',
        'Holcomb',
        'Mabry',
        'Cervantes',
        'Tribou',
        'Gessinger',
        'NULL',
        'Werner',
      ],
    },
    {
      idx: 30,
      nlevels: 112,
      surjections: [33, 1, 3, 39],
      isomorphisms: [29, 31],
      purpose: 'quality',
      levels: [
        'Todd',
        'Lynette',
        'Katie',
        'Matthew',
        'Jamie',
        'Elizabeth (Blake)',
        'Emmalyn',
        'Kara',
        'NULL',
        'Samantha',
      ],
    },
    {
      idx: 31,
      nlevels: 131,
      surjections: [1, 33, 3, 39, 30],
      isomorphisms: [29, 30],
      purpose: 'quality',
      levels: [
        'twood@amagpharma.com',
        'llord@amagpharma.com',
        'kjackson@amagpharma.com',
        'mholcomb@amagpharma.com',
        'jmabry@amagpharma.com',
        'bcervantes@amagpharma.com',
        'etribou@amagpharma.com',
        'kgessinger@amagpharma.com',
        'NULL',
        'swerner@amagpharma.com',
      ],
    },
    {
      idx: 32,
      nlevels: 296007,
      surjections: [
        1,
        3,
        4,
        5,
        6,
        16,
        17,
        18,
        19,
        20,
        21,
        22,
        23,
        24,
        25,
        26,
        27,
        28,
        29,
        30,
        31,
        33,
        39,
      ],
      isomorphisms: [2, 15],
      purpose: 'quality',
      levels: [
        '1770545626',
        '1689631574',
        '1760422893',
        '1790711711',
        '1144223447',
        '1093735110',
        '1356317507',
        '1285632463',
        '1710074026',
        '1154409316',
      ],
    },
    {
      idx: 33,
      nlevels: 1,
      surjections: [1],
      isomorphisms: [0, 1, 3, 39, 12],
      purpose: 'quality',
      levels: ['083118'],
    },
    {
      idx: 34,
      nlevels: 104,
      surjections: [0, 12],
      isomorphisms: [],
      purpose: 'mtime',
      levels: [
        '2018-08-31',
        '2018-08-24',
        '2018-08-17',
        '2018-08-03',
        '2018-07-13',
        '2018-05-18',
        '2018-04-27',
        '2018-04-13',
        '2018-03-16',
        '2018-02-23',
      ],
    },
    {
      idx: 35,
      nlevels: 6477,
      surjections: [0, 12],
      isomorphisms: [],
      purpose: 'mvalue',
      levels: [
        '1.052',
        '1.040',
        '1.024',
        '1.184',
        '1.006',
        '1.265',
        '1.035',
        '1.000',
        '1.027',
        '1.003',
      ],
    },
    {
      idx: 36,
      nlevels: 5161,
      surjections: [0, 12],
      isomorphisms: [],
      purpose: 'mvalue',
      levels: [
        'NULL',
        '1.040',
        '1.184',
        '1.006',
        '1.265',
        '1.035',
        '1.000',
        '1.003',
        '1.001',
        '1.055',
      ],
    },
    {
      idx: 37,
      nlevels: 21356,
      surjections: [0, 12],
      isomorphisms: [],
      purpose: 'mvalue',
      levels: [
        '44.700',
        '44.210',
        '43.510',
        '50.300',
        '42.740',
        '53.760',
        '43.990',
        '42.500',
        '43.640',
        '42.630',
      ],
    },
    {
      idx: 38,
      nlevels: 18856,
      surjections: [0, 12],
      isomorphisms: [],
      purpose: 'mvalue',
      levels: [
        'NULL',
        '44.210',
        '50.300',
        '42.740',
        '53.760',
        '43.990',
        '42.500',
        '42.630',
        '42.550',
        '44.830',
      ],
    },
    {
      idx: 39,
      nlevels: 2,
      surjections: [1, 33],
      isomorphisms: [0, 1, 33, 3, 12],
      purpose: 'quality',
      levels: ['Y', 'N'],
    },
    {
      idx: 40,
      nlevels: 16,
      surjections: [1, 33, 3, 39],
      isomorphisms: [],
      purpose: 'quality',
      levels: [
        'Blinded',
        'ESTRACE CRM VAG 0.01%',
        'PREMARIN VAG CRM W/APP ..625MG',
        'ESTRING VAG RING 2MG',
        'VAGIFEM TAB VAG 10MCG',
        'OSPHENA TAB FC 60MG',
        'YUVAFEM TAB VAG 10MCG',
        'Estradiol, Cream Vag, 0.01% Mylan',
        'ESTRADIOL TAB VAG 10MCG',
        'INTRAROSA INSERT VAG 6.5MG',
      ],
    },
  ],
};
