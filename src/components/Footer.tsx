import { Facebook, Twitter, Instagram, Youtube, Smartphone } from "lucide-react";

const footerCols = [
  {
    title: "About Us",
    links: ["About Indovyapar", "Careers", "Press", "Corporate Information"],
  },
  {
    title: "Sell With Us",
    links: ["Sell on Indovyapar", "Become a Supplier", "Advertise Your Products", "Partner Programs"],
  },
  {
    title: "Customer Support",
    links: ["Help Center", "Track Your Order", "Returns & Refunds", "Contact Us"],
  },
  {
    title: "Policies",
    links: ["Privacy Policy", "Terms of Service", "Shipping Policy", "Cancellation Policy"],
  },
];

export function Footer() {
  return (
    <footer
      className="w-full"
      style={{ background: "#1E5128", minHeight: 447 }}
    >
      <div
        className="mx-auto max-w-[1440px] px-4 sm:px-6"
        style={{ paddingTop: 45 }}
      >
        {/* Top 4-column links */}
        <div className="grid grid-cols-4 gap-8 pb-10">
          {footerCols.map((col) => (
            <div key={col.title} className="flex flex-col gap-3.5">
              <h3
                style={{
                  fontFamily: "'Nunito', 'Manrope', sans-serif",
                  fontWeight: 800,
                  fontSize: 15,
                  lineHeight: "23px",
                  color: "#FFFFFF",
                }}
              >
                {col.title}
              </h3>
              <ul className="flex flex-col gap-2.5">
                {col.links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      style={{
                        fontFamily: "'Manrope', sans-serif",
                        fontWeight: 400,
                        fontSize: 13,
                        lineHeight: "20px",
                        color: "#F4F4F4",
                        textDecoration: "none",
                      }}
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div style={{ borderTop: "0.94px solid #F4F4F4" }} />

        {/* Bottom bar */}
        <div
          className="flex flex-row justify-between items-center py-8"
        >
          {/* Download App */}
          <div className="flex flex-col gap-3">
            <h4
              style={{
                fontFamily: "'Nunito', 'Manrope', sans-serif",
                fontWeight: 800,
                fontSize: 14,
                lineHeight: "21px",
                color: "#FFFFFF",
              }}
            >
              Download Our App
            </h4>
            <div className="flex flex-row gap-3">
              {/* Google Play */}
              <button
                className="flex flex-row items-center gap-2 px-4"
                style={{
                  height: 51,
                  background: "#1E2939",
                  borderRadius: 9,
                }}
              >
                <Smartphone size={19} color="#FFFFFF" />
                <div className="flex flex-col items-start">
                  <span
                    style={{
                      fontFamily: "'Manrope', sans-serif",
                      fontWeight: 500,
                      fontSize: 9,
                      lineHeight: "14px",
                      color: "#F4F4F4",
                    }}
                  >
                    GET IT ON
                  </span>
                  <span
                    style={{
                      fontFamily: "'Manrope', sans-serif",
                      fontWeight: 700,
                      fontSize: 12,
                      lineHeight: "18px",
                      color: "#FFFFFF",
                    }}
                  >
                    Google Play
                  </span>
                </div>
              </button>

              {/* App Store */}
              <button
                className="flex flex-row items-center gap-2 px-4"
                style={{
                  height: 51,
                  background: "#1E2939",
                  borderRadius: 9,
                }}
              >
                <Smartphone size={19} color="#FFFFFF" />
                <div className="flex flex-col items-start">
                  <span
                    style={{
                      fontFamily: "'Manrope', sans-serif",
                      fontWeight: 500,
                      fontSize: 9,
                      lineHeight: "14px",
                      color: "#F4F4F4",
                    }}
                  >
                    DOWNLOAD ON
                  </span>
                  <span
                    style={{
                      fontFamily: "'Manrope', sans-serif",
                      fontWeight: 700,
                      fontSize: 12,
                      lineHeight: "18px",
                      color: "#FFFFFF",
                    }}
                  >
                    App Store
                  </span>
                </div>
              </button>
            </div>
          </div>

          {/* Social Links */}
          <div className="flex flex-col gap-3">
            <h4
              style={{
                fontFamily: "'Nunito', 'Manrope', sans-serif",
                fontWeight: 800,
                fontSize: 14,
                lineHeight: "21px",
                color: "#FFFFFF",
              }}
            >
              Connect With Us
            </h4>
            <div className="flex flex-row gap-4">
              {[
                { Icon: Facebook, label: "Facebook" },
                { Icon: Twitter, label: "Twitter" },
                { Icon: Instagram, label: "Instagram" },
                { Icon: Youtube, label: "Youtube" },
              ].map(({ Icon, label }) => (
                <a
                  key={label}
                  href="#"
                  className="flex items-center justify-center"
                  style={{
                    width: 38,
                    height: 38,
                    background: "#1E2939",
                    borderRadius: "50%",
                  }}
                  aria-label={label}
                >
                  <Icon size={19} color="#D1D5DC" />
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div
          className="flex items-center justify-center pb-6"
          style={{ borderTop: "0.94px solid rgba(244,244,244,0.2)" }}
        >
          <p
            style={{
              fontFamily: "'Manrope', sans-serif",
              fontWeight: 400,
              fontSize: 13,
              lineHeight: "20px",
              color: "rgba(244,244,244,0.7)",
              marginTop: 16,
            }}
          >
            © 2026 Indovyapar. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
