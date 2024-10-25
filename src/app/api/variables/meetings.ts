export const regions = new Map<string, string>();

regions.set("SE", "Sud-est");
regions.set("NE", "Nord-est");
regions.set("NO", "Nord-ouest");
regions.set("SO", "Sud-ouest");

export const imgPaths = new Map<string, string[]>();

imgPaths.set("man_woman", ["pexels-cottonbro-6789162.jpg", "pexels-jonathanborba-13780012.jpg", "pexels-leticiacurveloph-17463408.jpg"]);
imgPaths.set("man_man", ["pexels-ketut-subiyanto-4746650.jpg", "pexels-ketut-subiyanto-4833656.jpg"]);
imgPaths.set("woman_woman", ["pexels-felipebalduino-2546885.jpg", "pexels-felipebalduino-2546890.jpg"]);

export const orientations = new Map<string, string>();

orientations.set("man_woman", "Séance visio homme femme");
orientations.set("man_man", "Séance visio homme homme");
orientations.set("woman_woman", "Séance visio femme femme");