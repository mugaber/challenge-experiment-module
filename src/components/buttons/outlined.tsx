export default function OutlinedButton({
  children,
  onClick,
  isActive
}: {
  children: React.ReactNode
  onClick: () => void
  isActive: boolean
}) {
  return (
    <button
      className={`text-sm font-semibold hover:text-green-500 tracking-wider
        border-2 rounded-lg p-2 px-4 cursor-pointer uppercase ${
          isActive ? 'border-green-500' : 'border-white/50'
        } ${isActive ? 'text-green-500' : 'text-white/50'}`}
      onClick={onClick}
    >
      {children}
    </button>
  )
}
