const ProductPlaceholder = ({ className = "w-full h-48 object-cover" }) => {
  return (
    <svg
      className={className}
      viewBox="0 0 400 300"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="400" height="300" fill="#E5E7EB" className="dark:fill-gray-700" />
      <path
        d="M200 120C211.046 120 220 111.046 220 100C220 88.9543 211.046 80 200 80C188.954 80 180 88.9543 180 100C180 111.046 188.954 120 200 120Z"
        fill="#9CA3AF"
        className="dark:fill-gray-600"
      />
      <path
        d="M280 220L240 160L200 200L160 160L120 220H280Z"
        fill="#9CA3AF"
        className="dark:fill-gray-600"
      />
      <text
        x="200"
        y="260"
        textAnchor="middle"
        fill="#6B7280"
        fontSize="14"
        fontFamily="system-ui"
        className="dark:fill-gray-500"
      >
        Sin imagen
      </text>
    </svg>
  )
}

export default ProductPlaceholder
