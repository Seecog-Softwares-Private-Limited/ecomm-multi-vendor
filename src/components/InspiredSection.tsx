const inspiredProducts = [
  {
    src: "https://images.unsplash.com/photo-1750521280541-bbf9d813a890?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400",
    alt: "Fitness workout",
  },
  {
    src: "https://images.unsplash.com/photo-1648659125396-5bf148702e3d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400",
    alt: "Dumbbell",
  },
  {
    src: "https://images.unsplash.com/photo-1762014532579-ce204c09a11a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400",
    alt: "Bicycle",
  },
  {
    src: "https://images.unsplash.com/photo-1758599879039-625fda430fb7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400",
    alt: "Yoga mat",
  },
  {
    src: "https://images.unsplash.com/photo-1576834976341-53b1b975c6f9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400",
    alt: "Water bottle",
  },
];

export function InspiredSection() {
  return (
    <div className="w-full" style={{ background: "#FFFFFF" }}>
      <div className="mx-auto flex flex-col gap-5 py-8 px-4 sm:px-6 max-w-[1440px]">
        {/* Title */}
        <h2
          className="text-xl sm:text-2xl leading-tight"
          style={{
            fontFamily: "'Nunito','Manrope',sans-serif",
            fontWeight: 800,
            color: "#FF6A00",
          }}
        >
          Inspired by your browsing history
        </h2>

        {/* Horizontal scroll on mobile, 5-across on larger screens */}
        <div className="flex flex-nowrap gap-3 overflow-x-auto pb-2 sm:grid sm:grid-cols-5 sm:gap-6 sm:overflow-visible">
          {inspiredProducts.map((p, i) => (
            <div
              key={i}
              className="min-w-[96px] overflow-hidden sm:min-w-0"
              style={{ borderRadius: 12, aspectRatio: "1" }}
            >
              <img
                src={p.src}
                alt={p.alt}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                style={{ borderRadius: 12 }}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
