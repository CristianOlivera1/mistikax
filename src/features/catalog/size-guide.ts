import type { AgeGroup } from "@/lib/constants";

export type SizeGuideRow = {
  size: string;
  chest: string;
  waist: string;
  hip: string;
};

export type SizeGuideGroup = {
  age: AgeGroup;
  title: string;
  note: string;
  rows: SizeGuideRow[];
};

export const CLOTHING_GUIDE: SizeGuideGroup[] = [
  {
    age: "kids",
    title: "Niños (4 a 14 años)",
    note: "Medidas del cuerpo en centímetros. Si está entre dos tallas, elige la mayor.",
    rows: [
      { size: "4", chest: "56", waist: "53", hip: "58" },
      { size: "6", chest: "60", waist: "55", hip: "62" },
      { size: "8", chest: "64", waist: "58", hip: "66" },
      { size: "10", chest: "68", waist: "61", hip: "70" },
      { size: "12", chest: "72", waist: "64", hip: "74" },
      { size: "14", chest: "76", waist: "67", hip: "78" },
    ],
  },
  {
    age: "teens",
    title: "Jóvenes (XS a L)",
    note: "Corte juvenil. Medidas del cuerpo en centímetros.",
    rows: [
      { size: "XS", chest: "84", waist: "72", hip: "88" },
      { size: "S", chest: "88", waist: "76", hip: "92" },
      { size: "M", chest: "92", waist: "80", hip: "96" },
      { size: "L", chest: "96", waist: "84", hip: "100" },
    ],
  },
  {
    age: "adults",
    title: "Adultos (S a XXL)",
    note: "Corte regular. Medidas del cuerpo en centímetros.",
    rows: [
      { size: "S", chest: "94", waist: "78", hip: "96" },
      { size: "M", chest: "100", waist: "84", hip: "102" },
      { size: "L", chest: "106", waist: "90", hip: "108" },
      { size: "XL", chest: "112", waist: "96", hip: "114" },
      { size: "XXL", chest: "118", waist: "102", hip: "120" },
    ],
  },
];

export const FOOTWEAR_GUIDE: Array<{
  size: string;
  age: AgeGroup;
  footLength: string;
}> = [
  { size: "28", age: "kids", footLength: "18.0" },
  { size: "29", age: "kids", footLength: "18.6" },
  { size: "30", age: "kids", footLength: "19.3" },
  { size: "31", age: "kids", footLength: "20.0" },
  { size: "32", age: "kids", footLength: "20.6" },
  { size: "33", age: "kids", footLength: "21.3" },
  { size: "34", age: "kids", footLength: "22.0" },
  { size: "35", age: "teens", footLength: "22.6" },
  { size: "36", age: "teens", footLength: "23.3" },
  { size: "37", age: "teens", footLength: "24.0" },
  { size: "38", age: "teens", footLength: "24.6" },
  { size: "39", age: "adults", footLength: "25.3" },
  { size: "40", age: "adults", footLength: "26.0" },
  { size: "41", age: "adults", footLength: "26.6" },
  { size: "42", age: "adults", footLength: "27.3" },
  { size: "43", age: "adults", footLength: "28.0" },
  { size: "44", age: "adults", footLength: "28.6" },
];
