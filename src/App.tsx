import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Layout from '@/components/Layout'
import MenuEditor from '@/pages/MenuEditor'
import MenuPreview from '@/pages/MenuPreview'
import PrintPreview from '@/pages/PrintPreview'

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/menu-editor" replace />} />
          <Route path="menu-editor" element={<MenuEditor />} />
          <Route path="menu-preview" element={<MenuPreview />} />
          <Route path="print-preview" element={<PrintPreview />} />
        </Route>
      </Routes>
    </Router>
  )
}
