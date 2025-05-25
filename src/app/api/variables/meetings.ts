export const regions: string[] =
[
    "Auvergne-Rhône-Alpes",
    "Bourgogne-Franche-Comté",
    "Bretagne",
    "Centre-Val de Loire",
    "Corse",
    "Grand Est",
    "Guadeloupe",
    "Guyane",
    "Hauts-de-France",
    "Île-de-France",
    "La Réunion",
    "Martinique",
    "Mayotte",
    "Normandie",
    "Nouvelle-Aquitaine",
    "Occitanie",
    "Pays de la Loire",
    "Provence-Alpes-Côte d'Azur"
]

export const ages: string[] =
[
    "18 - 25",
    "26 - 35",
    "36 - 45",
    "46 - 55",
    "> 56"
];

export const imgPaths = new Map<string, string[]>();

imgPaths.set("man_woman", ["pexels-cottonbro-6789162.jpg", "pexels-jonathanborba-13780012.jpg", "pexels-leticiacurveloph-17463408.jpg"]);
imgPaths.set("man_man", ["pexels-ketut-subiyanto-4746650.jpg", "pexels-ketut-subiyanto-4833656.jpg"]);
imgPaths.set("woman_woman", ["pexels-felipebalduino-2546885.jpg", "pexels-felipebalduino-2546890.jpg"]);

export const orientations = new Map<string, string>();

orientations.set("man_woman", "Séance visio homme femme");
orientations.set("man_man", "Séance visio homme homme");
orientations.set("woman_woman", "Séance visio femme femme");

export const meetingDuration = 3600000;
export const dateDuration = 10 * 60 * 1000;