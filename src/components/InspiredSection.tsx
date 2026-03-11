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
          style={{
            fontFamily: "'Nunito','Manrope',sans-serif",
            fontWeight: 800,
            fontSize: 24,
            lineHeight: "39px",
            color: "#FF6A00",
          }}
        >
          Inspired by your browsing history
        </h2>

        {/* 5 product images */}
        <div className="flex flex-row gap-6">
          {inspiredProducts.map((p, i) => (
            <div
              key={i}
              className="flex-1 overflow-hidden"
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
