import { useNavigate } from 'react-router-dom'

export default function BackButton({ className = '' }) {
  const navigate = useNavigate()
  return (
    <button
      onClick={() => navigate(-1)}
      className={`inline-flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-[#0F4C81] transition-colors ${className}`}
    >
      <span className="material-symbols-outlined text-[18px]">arrow_back</span>
      Back
    </button>
  )
}
