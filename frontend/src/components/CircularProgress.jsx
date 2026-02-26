export default function CircularProgress({ value, size = 120, strokeWidth = 10, label }) {
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (value / 100) * circumference;
    const isGood = value >= 75;

    const gradientId = `progress-grad-${Math.random().toString(36).slice(2, 7)}`;

    return (
        <div className="flex flex-col items-center gap-2">
            <div className="relative" style={{ width: size, height: size }}>
                <svg width={size} height={size} className="-rotate-90">
                    <defs>
                        <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor={isGood ? '#10B981' : '#EF4444'} />
                            <stop offset="100%" stopColor={isGood ? '#059669' : '#DC2626'} />
                        </linearGradient>
                    </defs>
                    {/* Background track */}
                    <circle
                        cx={size / 2} cy={size / 2} r={radius}
                        fill="none"
                        stroke="rgba(148, 163, 184, 0.1)"
                        strokeWidth={strokeWidth}
                    />
                    {/* Progress arc */}
                    <circle
                        cx={size / 2} cy={size / 2} r={radius}
                        fill="none"
                        stroke={`url(#${gradientId})`}
                        strokeWidth={strokeWidth}
                        strokeLinecap="round"
                        strokeDasharray={circumference}
                        strokeDashoffset={offset}
                        style={{
                            transition: 'stroke-dashoffset 1s cubic-bezier(0.4, 0, 0.2, 1)',
                            filter: `drop-shadow(0 0 8px ${isGood ? 'rgba(16,185,129,0.4)' : 'rgba(239,68,68,0.4)'})`,
                        }}
                    />
                </svg>
                {/* Center text */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl font-bold text-white">{value}%</span>
                </div>
            </div>
            {label && <span className="text-xs font-medium" style={{ color: '#94A3B8' }}>{label}</span>}
        </div>
    );
}
