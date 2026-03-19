import { ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";

interface DealCard {
  title: string;
  cta: string;
  images: string[];
  href: string;
}

const dealCards: DealCard[] = [
  {
    title: "Up to 70% Off on Top Electronics\nLimited Time Deals. Fast Delivery",
    cta: "Explore Deals",
    images: [
      "https://images.unsplash.com/photo-1754761986430-5d0d44d09d00?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400",
      "https://images.unsplash.com/photo-1578517581165-61ec5ab27a19?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400",
      "https://images.unsplash.com/photo-1760520338259-64e68f6850b5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400",
      "https://images.unsplash.com/photo-1576057122708-9608db46b2f3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400",
    ],
    href: "/category/electronics",
  },
  {
    title: "Exchange Offers + Instant Bank Discounts\nSmarter Gadgets. Smarter Prices.",
    cta: "Explore Deals",
    images: [
      "https://images.unsplash.com/photo-1671072012624-c2089f89753f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400",
      "https://images.unsplash.com/photo-1731391747600-4d0f478b2184?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400",
      "https://images.unsplash.com/photo-1703482771739-caef1f39797e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400",
      "https://images.unsplash.com/photo-1767608403467-d30e6640b908?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400",
    ],
    href: "/category/electronics",
  },
  {
    title: "Own It Today. Pay Later.\nNo Cost EMI | 0% Interest | Easy Returns",
    cta: "Buy Now",
    images: [
      "https://images.unsplash.com/photo-1759722668253-1767030ad9b2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400",
      "https://images.unsplash.com/photo-1762690285055-fa80848e825b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400",
      "https://images.unsplash.com/photo-1758640927926-9f0b1cda712e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400",
      "https://images.unsplash.com/photo-1735980968208-1b85bdcd857b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400",
    ],
    href: "/category/deals",
  },
];

export function DealCards() {
  const router = useRouter();
  return (
    <div className="w-full flex items-center justify-center px-4 sm:px-6">
      <div
        className="flex flex-row justify-between w-full mx-auto max-w-[1440px]"
        style={{ gap: 43 }}
      >
        {dealCards.map((card, i) => (
          <div
            key={i}
            className="flex flex-col"
            style={{
              flex: 1,
              minWidth: 0,
              background: "#FFFFFF",
              boxShadow: "4px 4px 10px 2px rgba(0,0,0,0.1)",
              borderRadius: 12,
              padding: "20px 20px 20px 20px",
              gap: 0,
            }}
          >
            {/* Title — fixed min-height so images never bleed over it */}
            <p
              style={{
                fontFamily: "'Nunito','Manrope',sans-serif",
                fontWeight: 800,
                fontSize: 18,
                lineHeight: "34px",
                color: "#2B2B2B",
                whiteSpace: "pre-line",
                minHeight: 68,
                marginBottom: 16,
                flexShrink: 0,
              }}
            >
              {card.title}
            </p>

            {/* 2×2 image grid */}
            <div
              className="grid"
              style={{
                gridTemplateColumns: "1fr 1fr",
                gap: 10,
                flex: 1,
              }}
            >
              {card.images.map((src, j) => (
                <img
                  key={j}
                  src={src}
                  alt="product"
                  className="w-full object-cover"
                  style={{
                    height: 180,
                    borderRadius: 12,
                    display: "block",
                  }}
                />
              ))}
            </div>

            {/* CTA Button */}
            <button
              className="flex flex-row items-center gap-1.5 mt-4 self-start"
              onClick={() => router.push(card.href)}
              style={{
                padding: "9px 17px",
                background: "rgba(255,255,255,0.95)",
                boxShadow:
                  "0px 9.39px 14.08px -2.82px rgba(0,0,0,0.1), 0px 3.75px 5.63px -3.75px rgba(0,0,0,0.1)",
                borderRadius: 9,
                border: "none",
                cursor: "pointer",
              }}
            >
              <span
                style={{
                  fontFamily: "'Manrope',sans-serif",
                  fontWeight: 500,
                  fontSize: 18,
                  color: "#FF6A00",
                }}
              >
                {card.cta}
              </span>
              <ArrowRight size={15} color="#FF6A00" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
