interface TransparentButtonProps {
  children: React.ReactNode
  onClick: () => void
}

export default function TransparentButton({
  children,
  onClick
}: TransparentButtonProps) {
  return (
    <button
      className="text-white/50 font-semibold hover:text-white uppercase
        tracking-wider cursor-pointer"
      onClick={onClick}
    >
      {children}
    </button>
  )
}
