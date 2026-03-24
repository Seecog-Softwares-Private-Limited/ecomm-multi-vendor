import { ArrowRight } from "lucide-react";
import Link from "next/link";

interface PromoCard {
  gradient: string;
  title: string;
  subtitle: string;
  cta: string;
  image: string;
  href: string;
}

const promoCards: PromoCard[] = [
  {
    gradient: "linear-gradient(135deg, #1E5128 0%, #2D7A3E 100%)",
    title: "Furniture, Décor & Essentials",
    subtitle: "Flat 40% Off + Extra Cashback",
    cta: "Make It Yours",
    image: "https://images.unsplash.com/photo-1765766601447-9e11ad2356da?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=640",
    href: "/category/home",
  },
  {
    gradient: "linear-gradient(135deg, #FF6A00 0%, #FF8533 100%)",
    title: "Fitness Gear Starting ₹499",
    subtitle: "Up to 55% Off",
    cta: "Get Game Ready",
    image: "https://images.unsplash.com/photo-1722925541311-2117dfa21fe3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=640",
    href: "/category/sports",
  },
  {
    gradient: "linear-gradient(135deg, #2F6BFF 0%, #5285FF 100%)",
    title: "Welcome Offer",
    subtitle: "Up to 70% Off Across Categories",
    cta: "Explore Now",
    image: "https://images.unsplash.com/photo-1754761986430-5d0d44d09d00?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=640",
    href: "/category/deals",
  },
  {
    gradient: "linear-gradient(135deg, #FFC247 0%, #FFD470 100%)",
    title: "New Arrivals Dropped",
    subtitle: "From Casual to Festive — Everything You Love",
    cta: "Shop the Look",
    image: "https://images.unsplash.com/photo-1759840279499-f9de9764b2cf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=640",
    href: "/category/new-arrivals",
  },
  {
    gradient: "linear-gradient(135deg, #FF4D4D 0%, #FF7070 100%)",
    title: "Glow Up Sale",
    subtitle: "Skincare, Makeup & Grooming — Buy More. Save More.",
    cta: "Glow Now",
    image: "https://images.unsplash.com/photo-1595051665600-afd01ea7c446?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=640",
    href: "/category/beauty",
  },
];

export function PromoBanners() {
  return (
    <div className="w-full overflow-x-auto" style={{ scrollbarWidth: "none" }}>
      <div
        className="flex flex-row px-4 sm:px-6 box-border"
        style={{ gap: 10, width: "max-content" }}
      >
        {promoCards.map((card, i) => (
          <Link
            key={i}
            href={card.href}
            className="relative shrink-0 overflow-hidden block no-underline text-inherit rounded-xl transition-opacity hover:opacity-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FF6A00]"
            style={{
              width: 320,
              height: 200,
              borderRadius: 12,
              background: card.gradient,
            }}
            aria-label={`${card.title}. ${card.subtitle}. ${card.cta}`}
          >
            <img
              src={card.image}
              alt=""
              className="absolute inset-0 w-full h-full object-cover pointer-events-none"
              style={{ opacity: 0.2, borderRadius: 12 }}
              draggable={false}
            />

            <div className="absolute inset-0 flex flex-col justify-between p-5 pointer-events-none">
              <div>
                <p
                  style={{
                    fontFamily: "'Nunito', 'Manrope', sans-serif",
                    fontWeight: 800,
                    fontSize: 18,
                    lineHeight: "34px",
                    color: "#FFFFFF",
                  }}
                >
                  {card.title}
                </p>
                <p
                  style={{
                    fontFamily: "'Manrope', sans-serif",
                    fontWeight: 400,
                    fontSize: 16,
                    lineHeight: "21px",
                    color: "rgba(255,255,255,0.9)",
                    marginTop: 0,
                  }}
                >
                  {card.subtitle}
                </p>
              </div>

              <span
                className="flex flex-row items-center gap-1.5 self-start w-fit"
                style={{
                  padding: "9px 17px",
                  background: "rgba(255,255,255,0.95)",
                  boxShadow:
                    "0px 9.39px 14.08px -2.82px rgba(0,0,0,0.1), 0px 3.75px 5.63px -3.75px rgba(0,0,0,0.1)",
                  borderRadius: 9,
                }}
              >
                <span
                  style={{
                    fontFamily: "'Manrope', sans-serif",
                    fontWeight: 500,
                    fontSize: 18,
                    color: "#FF6A00",
                    whiteSpace: "nowrap",
                  }}
                >
                  {card.cta}
                </span>
                <ArrowRight size={15} color="#FF6A00" aria-hidden />
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
