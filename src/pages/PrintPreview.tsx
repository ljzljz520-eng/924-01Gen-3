import { useState, useRef } from 'react'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'
import { Download, Image, FileText, ChevronLeft, ChevronRight, Settings, Loader2, FlipHorizontal, Crop, ShieldCheck } from 'lucide-react'
import { useMenuStore } from '@/store'
import { ALLERGEN_LABELS, SPICE_LABELS } from '@/types'
import type { TemplateSize, Dish, Combo } from '@/types'
import { cn } from '@/lib/utils'

const SIZE_OPTS: { value: TemplateSize; label: string }[] = [
  { value: 'A4-trifold', label: 'A4三折页' },
  { value: 'A5-dual', label: 'A5双面' },
  { value: 'custom', label: '自定义' },
]
const SIZE_MM: Record<TemplateSize, { w: number; h: number }> = {
  'A4-trifold': { w: 210, h: 297 }, 'A5-dual': { w: 148, h: 210 }, custom: { w: 0, h: 0 },
}
const PAPER_PX: Record<TemplateSize, { w: number; h: number }> = {
  'A4-trifold': { w: 794, h: 1123 }, 'A5-dual': { w: 559, h: 794 }, custom: { w: 700, h: 900 },
}

function SpicinessDots({ level }: { level: number }) {
  return (
    <span className="inline-flex items-center gap-0.5 ml-1">
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i} className={cn('w-1.5 h-1.5 rounded-full', i < level ? `bg-spice-${level}` : 'bg-gray-200')} />
      ))}
    </span>
  )
}

function DishRow({ dish }: { dish: Dish }) {
  return (
    <div className="flex items-baseline justify-between py-1.5 border-b border-dashed border-brand-cream-dark last:border-0">
      <div className="flex-1 min-w-0 mr-2">
        <div className="flex items-center gap-1">
          <span className="font-serif text-sm text-brand-black truncate">{dish.name}</span>
          {dish.spiciness > 0 && <SpicinessDots level={dish.spiciness} />}
        </div>
        {dish.description && <p className="text-[10px] text-gray-400 truncate mt-0.5">{dish.description}</p>}
        {dish.allergens.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-0.5">
            {dish.allergens.map((a) => (
              <span key={a} className="text-[8px] px-1 rounded bg-brand-cream-dark text-brand-amber">{ALLERGEN_LABELS[a]}</span>
            ))}
          </div>
        )}
      </div>
      <span className="text-sm font-bold text-brand-red whitespace-nowrap">¥{dish.price}</span>
    </div>
  )
}

function CategoryBlock({ catId, catName, dishes }: { catId: string; catName: string; dishes: Dish[] }) {
  return (
    <div className="mb-4">
      <h3 className="font-serif text-sm font-bold text-brand-amber mb-2 flex items-center gap-2">
        <span className="w-4 h-px bg-brand-amber" />{catName}<span className="flex-1 h-px bg-brand-amber" />
      </h3>
      {dishes.filter((d) => d.category === catId).map((d) => <DishRow key={d.id} dish={d} />)}
    </div>
  )
}

function ComboCard({ combo, dishes, compact }: { combo: Combo; dishes: Dish[]; compact?: boolean }) {
  const items = combo.dishIds.map((id) => dishes.find((d) => d.id === id)).filter(Boolean) as Dish[]
  return (
    <div className={cn('bg-brand-cream rounded-lg', compact ? 'p-3' : 'p-3 mb-4')}>
      <div className="flex items-baseline justify-between mb-1">
        <span className="font-serif font-bold text-sm">{combo.name}</span>
        <span className="text-brand-red font-bold text-sm">¥{combo.comboPrice}</span>
      </div>
      {compact ? (
        <div className="flex flex-wrap gap-x-2 text-[10px] text-gray-500">{items.map((d) => <span key={d.id}>{d.name}</span>)}</div>
      ) : (
        <div className="space-y-1">{items.map((d) => (
          <div key={d.id} className="flex justify-between text-[10px] text-gray-500"><span>{d.name}</span><span>¥{d.price}</span></div>
        ))}</div>
      )}
      <div className="text-[10px] text-brand-green font-bold mt-1">立省 ¥{combo.savings}</div>
    </div>
  )
}

function Panel({ title, children, className }: { title: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('flex flex-col px-6 py-8', className)}>
      <h2 className="font-serif text-lg font-bold text-brand-black mb-4 text-center border-b-2 border-brand-red pb-2">{title}</h2>
      <div className="flex-1">{children}</div>
    </div>
  )
}

function TrifoldMenuContent() {
  const { dishes, combos, categories } = useMenuStore()
  const sorted = [...categories].sort((a, b) => a.order - b.order)
  const mid = Math.ceil(sorted.length / 2)
  const leftCats = sorted.slice(0, mid)
  const rightCats = sorted.slice(mid)
  return (
    <div className="w-full h-full bg-white font-sans text-brand-black">
      <div className="flex h-full">
        <div className="w-1/3 border-r border-brand-cream-dark flex flex-col">
          <Panel title="精选套餐" className="flex-1">{combos.map((c) => <ComboCard key={c.id} combo={c} dishes={dishes} />)}</Panel>
        </div>
        <div className="w-1/3 border-r border-brand-cream-dark flex flex-col">
          <Panel title={leftCats.map((c) => c.name).join(' · ')}>
            {leftCats.map((cat) => <CategoryBlock key={cat.id} catId={cat.id} catName={cat.name} dishes={dishes} />)}
          </Panel>
        </div>
        <div className="w-1/3 flex flex-col">
          <Panel title={rightCats.map((c) => c.name).join(' · ')}>
            {rightCats.map((cat) => <CategoryBlock key={cat.id} catId={cat.id} catName={cat.name} dishes={dishes} />)}
          </Panel>
          <div className="px-6 pb-6 text-center text-[10px] text-gray-400 leading-relaxed">
            <p>🌶 辣度: {SPICE_LABELS.map((l, i) => `${i}-${l}`).join(' ')}</p>
            <p className="mt-1">过敏原标识仅供参考，请咨询服务人员</p>
          </div>
        </div>
      </div>
    </div>
  )
}

function DualMenuContent() {
  const { dishes, combos, categories } = useMenuStore()
  const sorted = [...categories].sort((a, b) => a.order - b.order)
  return (
    <div className="w-full h-full bg-white font-sans text-brand-black p-8">
      <h2 className="font-serif text-2xl font-bold text-center text-brand-black mb-1">精 选 菜 单</h2>
      <div className="w-16 h-0.5 bg-brand-red mx-auto mb-6" />
      <div className="grid grid-cols-2 gap-6">
        {sorted.map((cat) => <CategoryBlock key={cat.id} catId={cat.id} catName={cat.name} dishes={dishes} />)}
      </div>
      {combos.length > 0 && (
        <div className="mt-6 border-t border-brand-cream-dark pt-4">
          <h3 className="font-serif text-base font-bold text-brand-amber mb-3 text-center">精选套餐</h3>
          <div className="grid grid-cols-2 gap-3">{combos.map((c) => <ComboCard key={c.id} combo={c} dishes={dishes} compact />)}</div>
        </div>
      )}
    </div>
  )
}

function FoldLines() {
  return (
    <>{[1, 2].map((n) => (
      <div key={n} className={`absolute ${n === 1 ? 'left-1/3' : 'left-2/3'} top-0 bottom-0 border-l-2 border-dashed border-blue-400/50 z-10 pointer-events-none`}>
        <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[10px] text-blue-500 bg-white px-1 whitespace-nowrap">折叠线</span>
      </div>
    ))}</>
  )
}

function CropMarks() {
  const L = 20, O = 8
  const corner = (x: number, y: number, dx: number, dy: number) => (
    <g transform={`translate(${x},${y})`}>
      <line x1={0} y1={0} x2={dx * L} y2={0} stroke="#E85D3A" strokeWidth={1.5} />
      <line x1={0} y1={0} x2={0} y2={dy * L} stroke="#E85D3A" strokeWidth={1.5} />
    </g>
  )
  return (
    <>
      <div className="absolute inset-0 border-4 border-red-200/40 z-10 pointer-events-none rounded-sm" />
      <svg className="absolute inset-0 w-full h-full z-10 pointer-events-none" style={{ overflow: 'visible' }}>
        {corner(O, O, 1, 1)}{corner(-O, O, -1, 1)}{corner(O, -O, 1, -1)}{corner(-O, -O, -1, -1)}
        <text x={O + 4} y={O + L + 12} fontSize={9} fill="#E85D3A" opacity={0.7}>裁切标记</text>
      </svg>
    </>
  )
}

function SafeZone() {
  return (
    <div className="absolute inset-8 border-2 border-dashed border-green-400/50 z-10 pointer-events-none">
      <span className="absolute -top-3.5 left-2 text-[10px] text-green-600 bg-white px-1">安全区</span>
    </div>
  )
}

function PrintOverlays() {
  const { templateConfig } = useMenuStore()
  return (
    <div className="absolute inset-0 z-10 pointer-events-none">
      {templateConfig.showFoldLines && templateConfig.size === 'A4-trifold' && <FoldLines />}
      {templateConfig.showCropMarks && <CropMarks />}
      {templateConfig.showSafeZone && <SafeZone />}
    </div>
  )
}

function Toggle({ checked, onChange, label, icon: Icon }: {
  checked: boolean; onChange: (v: boolean) => void; label: string
  icon: React.ComponentType<{ size?: number | string; className?: string }>
}) {
  return (
    <label className="flex items-center gap-2 cursor-pointer select-none">
      <Icon size={15} className="text-gray-400" />
      <span className="text-xs text-gray-600">{label}</span>
      <button type="button" role="switch" aria-checked={checked} onClick={() => onChange(!checked)}
        className={cn('relative inline-flex h-5 w-9 items-center rounded-full transition-colors', checked ? 'bg-brand-red' : 'bg-gray-300')}>
        <span className={cn('inline-block h-3.5 w-3.5 rounded-full bg-white shadow transition-transform', checked ? 'translate-x-4' : 'translate-x-0.5')} />
      </button>
    </label>
  )
}

function TopToolbar() {
  const { templateConfig, updateTemplateConfig } = useMenuStore()
  return (
    <div className="flex items-center gap-6 px-6 py-3 bg-white border-b border-gray-200 shadow-sm">
      <div className="flex items-center gap-2">
        <Settings size={16} className="text-gray-400" />
        <select value={templateConfig.size} onChange={(e) => updateTemplateConfig({ size: e.target.value as TemplateSize })}
          className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 bg-brand-cream focus:outline-none focus:ring-2 focus:ring-brand-red/30">
          {SIZE_OPTS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>
      <div className="h-5 w-px bg-gray-200" />
      <Toggle checked={templateConfig.showFoldLines} onChange={(v) => updateTemplateConfig({ showFoldLines: v })} label="折页线" icon={FlipHorizontal} />
      <Toggle checked={templateConfig.showCropMarks} onChange={(v) => updateTemplateConfig({ showCropMarks: v })} label="裁切标记" icon={Crop} />
      <Toggle checked={templateConfig.showSafeZone} onChange={(v) => updateTemplateConfig({ showSafeZone: v })} label="安全区" icon={ShieldCheck} />
      {templateConfig.size === 'custom' && (<>
        <div className="h-5 w-px bg-gray-200" />
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <label>宽 <input type="number" value={templateConfig.customWidth ?? 210} onChange={(e) => updateTemplateConfig({ customWidth: +e.target.value })} className="w-14 border border-gray-200 rounded px-1.5 py-1 text-center" /> mm</label>
          <label>高 <input type="number" value={templateConfig.customHeight ?? 297} onChange={(e) => updateTemplateConfig({ customHeight: +e.target.value })} className="w-14 border border-gray-200 rounded px-1.5 py-1 text-center" /> mm</label>
        </div>
      </>)}
    </div>
  )
}

function SidePanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { templateConfig } = useMenuStore()
  const mm = SIZE_MM[templateConfig.size]
  const w = templateConfig.size === 'custom' ? (templateConfig.customWidth ?? 0) : mm.w
  const h = templateConfig.size === 'custom' ? (templateConfig.customHeight ?? 0) : mm.h
  const spec = (label: string, val: string | number | boolean, on?: boolean) => (
    <div className="flex justify-between">
      <span className="text-gray-500">{label}</span>
      <span className={on ? 'text-brand-green font-medium' : on === false ? 'text-gray-400' : 'font-medium'}>
        {typeof val === 'boolean' ? (val ? '开启' : '关闭') : val}
      </span>
    </div>
  )
  return (
    <div className={cn('flex-shrink-0 bg-white border-l border-gray-200 transition-all duration-300 overflow-hidden', open ? 'w-60' : 'w-0')}>
      <div className="w-60 p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-brand-black">打印规格</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><ChevronRight size={16} /></button>
        </div>
        <div className="space-y-3 text-xs">
          {spec('模板尺寸', SIZE_OPTS.find((o) => o.value === templateConfig.size)?.label ?? '')}
          {spec('打印尺寸', `${w}×${h}mm`)}
          {spec('折页线', templateConfig.showFoldLines, templateConfig.showFoldLines)}
          {spec('裁切标记', templateConfig.showCropMarks, templateConfig.showCropMarks)}
          {spec('安全区', templateConfig.showSafeZone, templateConfig.showSafeZone)}
          <hr className="border-gray-100" />
          <div className="text-gray-400 leading-relaxed text-[11px]">
            <p>A4: 210×297mm</p><p>A5: 148×210mm</p><p>出血区: 3mm</p><p>安全边距: 5mm</p>
          </div>
        </div>
      </div>
    </div>
  )
}

function BottomToolbar({ onExport, exporting }: { onExport: (t: 'pdf' | 'png' | 'all') => void; exporting: boolean }) {
  const btn = (label: string, type: 'pdf' | 'png' | 'all', bg: string, Icon: typeof FileText) => (
    <button onClick={() => onExport(type)} disabled={exporting}
      className={`flex items-center gap-2 px-5 py-2.5 ${bg} text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}>
      {exporting ? <Loader2 size={16} className="animate-spin" /> : <Icon size={16} />}{label}
    </button>
  )
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur border-t border-gray-200 shadow-lg">
      <div className="flex items-center justify-center gap-4 px-6 py-3">
        {btn('导出 PDF', 'pdf', 'bg-brand-red hover:bg-brand-red-hover', FileText)}
        {btn('导出 PNG', 'png', 'bg-brand-black hover:bg-gray-800', Image)}
        {btn('导出全部', 'all', 'bg-brand-amber hover:bg-amber-600', Download)}
      </div>
    </div>
  )
}

export default function PrintPreview() {
  const { templateConfig } = useMenuStore()
  const [exporting, setExporting] = useState(false)
  const [sideOpen, setSideOpen] = useState(true)
  const previewRef = useRef<HTMLDivElement>(null)
  const paper = PAPER_PX[templateConfig.size]

  const capture = (el: HTMLElement | null) =>
    el ? html2canvas(el, { scale: 2, useCORS: true, backgroundColor: '#ffffff' }) : null

  const addPdfPage = (pdf: jsPDF, canvas: HTMLCanvasElement, label?: string) => {
    const pw = pdf.internal.pageSize.getWidth()
    const ph = (canvas.height * pw) / canvas.width
    pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, pw, ph)
    if (label) { pdf.setFontSize(8); pdf.setTextColor(150); pdf.text(label, pw / 2, ph + 8, { align: 'center' }) }
  }

  const handleExport = async (type: 'pdf' | 'png' | 'all') => {
    setExporting(true)
    try {
      const el = document.getElementById('print-preview-content')
      if (!el) return
      const canvas = await capture(el)
      if (!canvas) return
      if (type === 'png') {
        const a = document.createElement('a'); a.download = 'menu.png'; a.href = canvas.toDataURL('image/png'); a.click()
      } else if (type === 'pdf') {
        const pdf = new jsPDF('p', 'mm', 'a4'); addPdfPage(pdf, canvas); pdf.save('menu.pdf')
      } else {
        const pdf = new jsPDF('p', 'mm', 'a4')
        for (const label of ['堂食菜单', '外卖菜单', '桌面贴纸']) {
          const c = await capture(el); if (!c) continue
          if (label !== '堂食菜单') pdf.addPage(); addPdfPage(pdf, c, label)
        }
        pdf.save('menu-all-versions.pdf')
      }
    } catch (err) { console.error('Export failed:', err) } finally { setExporting(false) }
  }

  return (
    <div className="flex flex-col h-full">
      <TopToolbar />
      <div className="flex flex-1 overflow-hidden">
        <div ref={previewRef} className="flex-1 overflow-auto bg-gray-200 pb-20">
          <div className="flex justify-center py-8 px-4">
            <div className="relative" style={{ width: paper.w, minHeight: paper.h }}>
              <div id="print-preview-content" className="bg-white shadow-2xl rounded-sm relative" style={{ width: paper.w, minHeight: paper.h }}>
                {templateConfig.size === 'A4-trifold' ? <TrifoldMenuContent /> : <DualMenuContent />}
              </div>
              <PrintOverlays />
            </div>
          </div>
        </div>
        <SidePanel open={sideOpen} onClose={() => setSideOpen(false)} />
        {!sideOpen && (
          <button onClick={() => setSideOpen(true)}
            className="fixed right-0 top-1/2 -translate-y-1/2 z-40 bg-white border border-gray-200 border-r-0 rounded-l-lg p-1.5 shadow-md hover:bg-gray-50">
            <ChevronLeft size={16} className="text-gray-400" />
          </button>
        )}
      </div>
      <BottomToolbar onExport={handleExport} exporting={exporting} />
    </div>
  )
}
