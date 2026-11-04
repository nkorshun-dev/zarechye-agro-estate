export type Amenity = 'sauna' | 'fireplace' | 'lake' | 'pets' | 'wifi' | 'kitchen' | 'terrace' | 'bbq' | 'parking'

export interface House {
  slug: string
  name: string
  tagline: string
  description: string
  baseGuests: number
  maxGuests: number
  bedrooms: number
  area: number
  priceWeekday: number
  priceWeekend: number
  priceNewYear: number
  amenities: Amenity[]
  pets: boolean
  images: string[]
}

export type NightType = 'weekday' | 'weekend' | 'holiday' | 'newyear'

export interface NightPrice {
  date: string
  type: NightType
  price: number
}

export interface SaunaSession {
  date: string
  time: string
}

export interface ExtrasSelection {
  saunaSessions: SaunaSession[]
  breakfast: boolean
  sup: number
  boat: number
  transfer: number
  lateCheckout: boolean
}

export interface Extra {
  id: keyof ExtrasSelection
  name: string
  description: string
  price: number
  unit: string
  season: string
  image: string
}

export interface Guests {
  adults: number
  childAges: number[]
  pets: number
}

export interface Quote {
  nights: NightPrice[]
  groups: { type: NightType; count: number; sum: number }[]
  nightsTotal: number
  payingGuestsOver: number
  guestSurcharge: number
  extrasLines: { label: string; sum: number }[]
  extrasTotal: number
  discount: number
  total: number
  prepayment: number
}

export interface StoredBooking {
  id: string
  houseSlug: string
  checkIn: string
  checkOut: string
  guests: Guests
  total: number
  prepayment: number
  name: string
  phone: string
  createdAt: string
}

export interface Review {
  id: string
  author: string
  occasion: string
  date: string
  rating: number
  text: string
  reply?: string
}

export interface FaqItem {
  q: string
  a: string
}
