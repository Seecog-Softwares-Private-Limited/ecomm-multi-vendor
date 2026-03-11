import { MapPin, Headphones, Package } from "lucide-react";

export function TopBar() {
  return (
    <div
      className="w-full flex flex-row justify-between items-center px-11"
      style={{ height: 38, background: "#DFDFDF" }}
    >
      {/* Left side */}
      <div className="flex flex-row items-center gap-6">
        <button className="flex flex-row items-center gap-1.5">
          <MapPin size={13} className="text-black shrink-0" />
          <span
            style={{
              fontFamily: "'Manrope', sans-serif",
              fontWeight: 500,
              fontSize: 15,
              color: "#000000",
              whiteSpace: "nowrap",
            }}
          >
            Deliver to Mumbai
          </span>
        </button>
        <button className="flex flex-row items-center gap-1.5">
          <Headphones size={13} className="text-black shrink-0" />
          <span
            style={{
              fontFamily: "'Manrope', sans-serif",
              fontWeight: 500,
              fontSize: 15,
              color: "#000000",
              whiteSpace: "nowrap",
            }}
          >
            Customer Support
          </span>
        </button>
      </div>

      {/* Right side */}
      <div className="flex flex-row items-center gap-6">
        <button>
          <span
            style={{
              fontFamily: "'Manrope', sans-serif",
              fontWeight: 500,
              fontSize: 15,
              color: "#000000",
            }}
          >
            Sell on Platform
          </span>
        </button>
        <button>
          <span
            style={{
              fontFamily: "'Manrope', sans-serif",
              fontWeight: 500,
              fontSize: 15,
              color: "#000000",
            }}
          >
            Download App
          </span>
        </button>
        <button className="flex flex-row items-center gap-1.5">
          <Package size={13} className="text-black shrink-0" />
          <span
            style={{
              fontFamily: "'Manrope', sans-serif",
              fontWeight: 500,
              fontSize: 15,
              color: "#000000",
            }}
          >
            Track Order
          </span>
        </button>
      </div>
    </div>
  );
}
