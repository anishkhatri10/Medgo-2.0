export default function MedgoLogo({ size = 'md', showText = true }) {
  const sizeMap = {
    sm: { container: 'w-10 h-10', text: 'text-base', logo: 24 },
    md: { container: 'w-12 h-12', text: 'text-xl', logo: 32 },
    lg: { container: 'w-16 h-16', text: 'text-2xl', logo: 48 },
    xl: { container: 'w-20 h-20', text: 'text-3xl', logo: 64 },
  };

  const sizes = sizeMap[size] || sizeMap.md;
  const logoSize = sizes.logo;

  return (
    <div className="flex items-center gap-3">
      {/* SVG Logo */}
      <div className={`${sizes.container} bg-gradient-to-br from-red-600 to-red-500 rounded-2xl flex items-center justify-center shadow-lg shadow-red-600/30`}>
        <svg
          width={logoSize}
          height={logoSize}
          viewBox="0 0 64 64"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Ambulance/Medical Cross Shape */}
          <g>
            {/* Main cross - medical symbol */}
            <rect x="24" y="12" width="16" height="40" fill="white" rx="2" />
            <rect x="12" y="24" width="40" height="16" fill="white" rx="2" />

            {/* Accent circles */}
            <circle cx="32" cy="32" r="6" fill="#fee2e2" opacity="0.8" />
          </g>

          {/* Ambulance silhouette elements */}
          <g>
            {/* Front indicator */}
            <circle cx="54" cy="48" r="3" fill="white" />
          </g>
        </svg>
      </div>

      {/* Text Logo */}
      {showText && (
        <div className="flex flex-col">
          <span className={`font-black bg-gradient-to-r from-red-600 to-red-500 bg-clip-text text-transparent ${sizes.text}`}>
            MEDGO
          </span>
          <span className="text-xs text-gray-500 font-semibold tracking-wider">Emergency Care</span>
        </div>
      )}
    </div>
  );
}
