import { useState } from 'react'
import { Utensils, Smartphone, QrCode } from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'
import { useMenuStore } from '@/store'
import { ALLERGEN_LABELS, SPICE_LABELS } from '@/types'
import type { Dish, Allergen } from '@/types'

type TabKey = 'dine-in' | 'takeout' | 'qr'

const TABS: { key: TabKey; label: string; icon: typeof Utensils }[] = [
  { key: 'dine-in', label: '堂食菜单', icon: Utensils },
  { key: 'takeout', label: '外卖图', icon: Smartphone },
  { key: 'qr', label: '桌贴二维码', icon: QrCode },
]

const ALLERGEN_COLORS: Record<Allergen, string> = {
  peanut: 'bg-amber-700',
  dairy: 'bg-blue-400',
  gluten: 'bg-yellow-600',
  seafood: 'bg-cyan-500',
  egg: 'bg-yellow-400',
  soy: 'bg-green-600',
  nuts: 'bg-amber-500',
  sesame: 'bg-gray-500',
}

function SpiceDots({ level, size = 'w-1.5 h-1.5' }: { level: number; size?: string }) {
  return (
    <span className="inline-flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <span
          key={i}
          className={`${size} rounded-full ${i < level ? `bg-spice-${level as 1|2|3|4|5}` : 'bg-gray-200'}`}
        />
      ))}
    </span>
  )
}

function AllergenDots({ allergens }: { allergens: Allergen[] }) {
  return (
    <span className="inline-flex items-center gap-0.5">
      {allergens.map((a) => (
        <span key={a} className={`w-1.5 h-1.5 rounded-full ${ALLERGEN_COLORS[a]}`} title={ALLERGEN_LABELS[a]} />
      ))}
    </span>
  )
}

function DishRow({ dish, variant = 'print' }: { dish: Dish; variant?: 'print' | 'mobile' }) {
  if (variant === 'mobile') {
    return (
      <div className="flex items-start justify-between py-2 border-b border-brand-cream-dark last:border-0">
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm text-brand-black truncate">{dish.name}</p>
          <div className="flex items-center gap-2 mt-0.5">
            <SpiceDots level={dish.spiciness} size="w-1 h-1" />
            {dish.allergens.length > 0 && (
              <span className="flex items-center gap-0.5">
                {dish.allergens.map((a) => (
                  <span key={a} className="text-[8px] px-1 py-px rounded bg-brand-cream-dark text-brand-black/60">
                    {ALLERGEN_LABELS[a]}
                  </span>
                ))}
              </span>
            )}
          </div>
        </div>
        <span className="text-brand-red font-bold text-lg ml-3">¥{dish.price}</span>
      </div>
    )
  }
  return (
    <div className="flex items-center justify-between py-1.5 border-b border-dashed border-gray-200 last:border-0">
      <div className="flex items-center gap-1.5 min-w-0">
        <span className="text-[11px] text-brand-black truncate">{dish.name}</span>
        <SpiceDots level={dish.spiciness} size="w-1 h-1" />
        <AllergenDots allergens={dish.allergens} />
      </div>
      <span className="text-[11px] font-semibold text-brand-black ml-2 shrink-0">¥{dish.price}</span>
    </div>
  )
}

function DineInPreview() {
  const { dishes, combos, categories, templateConfig } = useMenuStore()
  const sorted = [...categories].sort((a, b) => a.order - b.order)
  const dishMap = new Map(dishes.map((d) => [d.id, d]))

  return (
    <div className="flex items-center justify-center min-h-full py-10 px-4">
      <div
        className="relative bg-white shadow-2xl"
        style={{
          width: 794,
          height: 1123,
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.015'/%3E%3C/svg%3E")`,
        }}
      >
        {templateConfig.showFoldLines && (
          <>
            <div className="absolute top-0 bottom-0 left-1/3 w-px border-l-2 border-dashed border-gray-300/50 z-10" />
            <div className="absolute top-0 bottom-0 left-2/3 w-px border-l-2 border-dashed border-gray-300/50 z-10" />
          </>
        )}
        <div className="flex h-full">
          <div className="flex-1 flex flex-col items-center justify-center px-6 border-r border-gray-100">
            <div className="w-full border-2 border-brand-red/30 rounded-sm p-6 text-center">
              <div className="w-12 h-px bg-brand-red/40 mx-auto mb-4" />
              <h2 className="font-serif text-2xl text-brand-black tracking-widest">味道小馆</h2>
              <div className="w-8 h-px bg-brand-red/30 mx-auto my-3" />
              <p className="text-[10px] text-brand-black/50 tracking-[0.3em]">地道川味 · 匠心烹饪</p>
              <div className="w-12 h-px bg-brand-red/40 mx-auto mt-4" />
            </div>
            <div className="mt-8 text-center">
              <p className="text-[9px] text-brand-black/30 leading-relaxed">
                营业时间<br />11:00 - 14:00<br />17:00 - 22:00
              </p>
            </div>
          </div>

          <div className="flex-1 px-5 py-8 overflow-hidden border-r border-gray-100">
            {sorted.map((cat, idx) => {
              const catDishes = dishes.filter((d) => d.category === cat.id)
              if (catDishes.length === 0) return null
              return (
                <div key={cat.id} className={idx > 0 ? 'mt-4' : ''}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-3 h-px bg-brand-red/50" />
                    <h3 className="font-serif text-xs text-brand-red tracking-wider">{cat.name}</h3>
                    <span className="flex-1 h-px bg-brand-red/20" />
                  </div>
                  {catDishes.map((dish) => (
                    <DishRow key={dish.id} dish={dish} />
                  ))}
                </div>
              )
            })}
          </div>

          <div className="flex-1 px-5 py-8 overflow-hidden">
            <div className="flex items-center gap-2 mb-3">
              <span className="w-3 h-px bg-brand-amber" />
              <h3 className="font-serif text-xs text-brand-amber tracking-wider">超值套餐</h3>
              <span className="flex-1 h-px bg-brand-amber/20" />
            </div>
            {combos.map((combo) => {
              const comboDishes = combo.dishIds.map((id) => dishMap.get(id)).filter(Boolean) as Dish[]
              return (
                <div key={combo.id} className="mb-4 p-3 border border-brand-amber/30 rounded-sm bg-brand-amber-light/30">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-serif text-xs font-bold text-brand-black">{combo.name}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-brand-green text-white font-medium">
                      省¥{combo.savings}
                    </span>
                  </div>
                  <div className="space-y-0.5 mb-2">
                    {comboDishes.map((d) => (
                      <p key={d.id} className="text-[10px] text-brand-black/60">· {d.name}</p>
                    ))}
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-sm text-brand-red">¥{combo.comboPrice}</span>
                  </div>
                </div>
              )
            })}
            <div className="mt-6 pt-3 border-t border-gray-200">
              <p className="text-[8px] text-brand-black/30 leading-relaxed">
                过敏提示：本菜单标注了常见过敏原，<br />如有特殊需求请告知服务员。
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function TakeoutPreview() {
  const { dishes, combos, categories } = useMenuStore()
  const sorted = [...categories].sort((a, b) => a.order - b.order)
  const dishMap = new Map(dishes.map((d) => [d.id, d]))

  return (
    <div className="flex items-center justify-center min-h-full py-10 px-4">
      <div className="rounded-[2.5rem] border-[6px] border-brand-black bg-brand-black p-1 shadow-2xl">
        <div
          className="rounded-[2rem] overflow-hidden bg-brand-cream"
          style={{ width: 375, height: 667 }}
        >
          <div className="relative h-24 bg-gradient-to-br from-brand-red to-brand-red/80 flex items-end px-5 pb-4">
            <div>
              <h2 className="font-serif text-xl text-white font-bold tracking-wider">味道小馆</h2>
              <p className="text-[10px] text-white/70 mt-0.5">地道川味 · 匠心烹饪</p>
            </div>
          </div>
          <div className="px-4 pt-3 overflow-y-auto" style={{ height: 667 - 96 }}>
            {sorted.map((cat) => {
              const catDishes = dishes.filter((d) => d.category === cat.id)
              if (catDishes.length === 0) return null
              return (
                <div key={cat.id} className="mb-4">
                  <h3 className="font-serif text-sm font-bold text-brand-black mb-2 flex items-center gap-2">
                    <span className="w-1 h-4 bg-brand-red rounded-full" />
                    {cat.name}
                  </h3>
                  {catDishes.map((dish) => (
                    <DishRow key={dish.id} dish={dish} variant="mobile" />
                  ))}
                </div>
              )
            })}
            {combos.length > 0 && (
              <div className="mb-4">
                <h3 className="font-serif text-sm font-bold text-brand-black mb-2 flex items-center gap-2">
                  <span className="w-1 h-4 bg-brand-amber rounded-full" />
                  超值套餐
                </h3>
                {combos.map((combo) => {
                  const comboDishes = combo.dishIds.map((id) => dishMap.get(id)).filter(Boolean) as Dish[]
                  return (
                    <div key={combo.id} className="p-3 rounded-xl border-2 border-brand-amber/40 bg-brand-amber-light mb-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sm text-brand-black">{combo.name}</span>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-brand-green text-white font-medium">
                          省¥{combo.savings}
                        </span>
                      </div>
                      <p className="text-[10px] text-brand-black/50 mt-1">
                        含：{comboDishes.map((d) => d.name).join('、')}
                      </p>
                      <div className="text-right mt-1">
                        <span className="text-lg font-bold text-brand-red">¥{combo.comboPrice}</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function TableQRPreview() {
  const tableNos = ['A1', 'A2', 'B1']
  return (
    <div className="flex items-center justify-center min-h-full py-10 px-4">
      <div className="flex items-end gap-8">
        {tableNos.map((no) => (
          <div key={no} className="flex flex-col items-center">
            <div
              className="bg-white shadow-lg border border-gray-200 px-5 py-4 rounded-sm relative"
              style={{
                width: 140,
                backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.02'/%3E%3C/svg%3E")`,
              }}
            >
              <div className="absolute inset-2 border border-brand-red/20 rounded-sm pointer-events-none" />
              <div className="flex justify-center mb-2">
                <QRCodeSVG
                  value={`https://weidao.menu/order?table=${no}`}
                  size={80}
                  level="M"
                  bgColor="#FFFFFF"
                  fgColor="#1A1A1A"
                />
              </div>
              <p className="font-serif text-center text-xs text-brand-black tracking-widest mt-2">味道小馆</p>
              <p className="text-center text-[9px] text-brand-red/70 mt-0.5">扫码点餐</p>
              <div className="mt-2 pt-1.5 border-t border-gray-100 text-center">
                <p className="text-[8px] text-brand-black/30">WiFi: Weidao_5G</p>
              </div>
            </div>
            <div className="mt-2 text-[10px] text-brand-black/30 font-medium">{no}桌</div>
            <div className="w-20 h-1 bg-brand-cream-dark rounded-b-full shadow-sm mt-1" />
          </div>
        ))}
      </div>
    </div>
  )
}

export default function MenuPreview() {
  const [activeTab, setActiveTab] = useState<TabKey>('dine-in')

  return (
    <div className="h-full flex flex-col bg-brand-cream">
      <div className="flex items-center justify-between px-6 py-3 bg-white border-b border-brand-cream-dark">
        <div className="flex items-center gap-1">
          {TABS.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-all duration-200 ${
                activeTab === key
                  ? 'bg-brand-red text-white shadow-sm'
                  : 'text-brand-black/60 hover:bg-brand-cream'
              }`}
            >
              <Icon size={16} />
              {label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1" title="同步状态">
          {[1, 2, 3].map((i) => (
            <span key={i} className="w-2 h-2 rounded-full bg-brand-green" />
          ))}
        </div>
      </div>
      <div className="flex-1 overflow-auto">
        {activeTab === 'dine-in' && <DineInPreview />}
        {activeTab === 'takeout' && <TakeoutPreview />}
        {activeTab === 'qr' && <TableQRPreview />}
      </div>
    </div>
  )
}
