export type Allergen = 'peanut' | 'dairy' | 'gluten' | 'seafood' | 'egg' | 'soy' | 'nuts' | 'sesame'

export interface Dish {
  id: string
  name: string
  price: number
  category: string
  spiciness: 0 | 1 | 2 | 3 | 4 | 5
  allergens: Allergen[]
  image?: string
  description?: string
}

export interface Combo {
  id: string
  name: string
  dishIds: string[]
  comboPrice: number
  savings: number
}

export interface Category {
  id: string
  name: string
  order: number
}

export type TemplateSize = 'A4-trifold' | 'A5-dual' | 'custom'

export interface TemplateConfig {
  size: TemplateSize
  customWidth?: number
  customHeight?: number
  showFoldLines: boolean
  showCropMarks: boolean
  showSafeZone: boolean
}

export const ALLERGEN_LABELS: Record<Allergen, string> = {
  peanut: '花生',
  dairy: '乳制品',
  gluten: '麸质',
  seafood: '海鲜',
  egg: '鸡蛋',
  soy: '大豆',
  nuts: '坚果',
  sesame: '芝麻',
}

export const SPICE_LABELS = ['不辣', '微辣', '小辣', '中辣', '大辣', '特辣'] as const
