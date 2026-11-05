import type { Amenity, House } from '../types'

const img = (id: string, w = 1400) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=70`

export const houses: House[] = [
  {
    slug: 'sosnovy',
    name: 'Сосновый',
    tagline: 'Маленький дом для двоих среди сосен',
    description: 'Бревенчатый дом в тридцати шагах от леса. Внутри спальня с большой кроватью, кухня-гостиная и печка. На террасе по утрам бегают белки. Если нужно третье место, в гостиной раскладывается диван.',
    baseGuests: 2,
    maxGuests: 3,
    bedrooms: 1,
    area: 36,
    priceWeekday: 142,
    priceWeekend: 188,
    priceNewYear: 260,
    amenities: ['wifi', 'kitchen', 'terrace', 'bbq', 'parking'],
    pets: false,
    images: [img('1587061949409-02df41d5e562'), img('1441974231531-c6227db76b6e'), img('1470071459604-3b5ec3a7fe05')],
  },
  {
    slug: 'rybatsky',
    name: 'Рыбацкий',
    tagline: 'Дом у воды с камином, для семьи или двух пар',
    description: 'Дом стоит ближе всех к озеру: до причала 50 метров. Две спальни, гостиная с камином и веранда с видом на воду. Рядом лодка и место для удочек. Хорошо подходит, если вы приезжаете с собакой.',
    baseGuests: 4,
    maxGuests: 6,
    bedrooms: 2,
    area: 64,
    priceWeekday: 214,
    priceWeekend: 276,
    priceNewYear: 390,
    amenities: ['lake', 'fireplace', 'pets', 'wifi', 'kitchen', 'terrace', 'parking'],
    pets: true,
    images: [img('1510798831971-661eb04b3739'), img('1470770841072-f978cf4d019e'), img('1501785888041-af3ef285b470')],
  },
  {
    slug: 'bannyi-dom',
    name: 'Банный дом',
    tagline: 'Дом с настоящей баней на дровах',
    description: 'Дом из двух частей: слева жилая половина с тремя спальнями, справа русская баня с парной, комнатой отдыха и купелью. Выход прямо на поляну с мангалом. Подходит компании друзей на выходные.',
    baseGuests: 6,
    maxGuests: 8,
    bedrooms: 3,
    area: 92,
    priceWeekday: 338,
    priceWeekend: 419,
    priceNewYear: 640,
    amenities: ['sauna', 'pets', 'fireplace', 'wifi', 'kitchen', 'terrace', 'bbq', 'parking'],
    pets: true,
    images: [img('1518780664697-55e3ad937233'), img('1475924156734-496f6cac6ec1'), img('1472214103451-9374bd1c798e')],
  },
  {
    slug: 'bolshoy-dom',
    name: 'Большой дом',
    tagline: 'Для большой семьи, свадьбы и корпоратива',
    description: 'Двухэтажный дом на пять спален с длинным столом на двенадцать человек, камином и верандой. Со второго этажа видно озеро. Рядом большой мангал, беседка и парковка на несколько машин.',
    baseGuests: 10,
    maxGuests: 12,
    bedrooms: 5,
    area: 168,
    priceWeekday: 512,
    priceWeekend: 640,
    priceNewYear: 980,
    amenities: ['lake', 'fireplace', 'pets', 'wifi', 'kitchen', 'terrace', 'bbq', 'parking'],
    pets: true,
    images: [img('1464146072230-91cabc968266'), img('1542718610-a1d656d1884c'), img('1506905925346-21bda4d32df4')],
  },
]

export const amenityLabels: Record<Amenity, string> = {
  sauna: 'Баня',
  fireplace: 'Камин',
  lake: 'Вид на озеро',
  pets: 'Можно с питомцами',
  wifi: 'Wi-Fi',
  kitchen: 'Кухня',
  terrace: 'Терраса',
  bbq: 'Мангал',
  parking: 'Парковка',
}

export const amenityIcons: Record<Amenity, string> = {
  sauna: '♨', fireplace: '🔥', lake: '🌊', pets: '🐾', wifi: '📶', kitchen: '🍳', terrace: '🪑', bbq: '🥩', parking: '🚗',
}

export const getHouse = (slug: string | null | undefined) => houses.find((h) => h.slug === slug)
