import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "SalaryAfterTax - Free Take-Home Pay Calculator";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #047857 0%, #1f2937 50%, #111827 100%)",
          padding: "60px",
          position: "relative",
        }}
      >
        {/* Decorative money symbols - top left */}
        <div
          style={{
            position: "absolute",
            top: "40px",
            left: "40px",
            fontSize: "80px",
            color: "rgba(16, 185, 129, 0.2)",
            display: "flex",
            gap: "20px",
          }}
        >
          <span>$</span>
          <span>€</span>
          <span>£</span>
        </div>

        {/* Decorative money symbols - bottom right */}
        <div
          style={{
            position: "absolute",
            bottom: "40px",
            right: "40px",
            fontSize: "80px",
            color: "rgba(16, 185, 129, 0.2)",
            display: "flex",
            gap: "20px",
          }}
        >
          <span>¥</span>
          <span>₹</span>
          <span>A$</span>
        </div>

        {/* Main content */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            zIndex: 1,
          }}
        >
          {/* Site name */}
          <div
            style={{
              fontSize: "88px",
              fontWeight: "bold",
              color: "#ffffff",
              letterSpacing: "-0.02em",
              marginBottom: "20px",
              textShadow: "0 4px 12px rgba(0, 0, 0, 0.5)",
            }}
          >
            SalaryAfterTax
          </div>

          {/* Tagline */}
          <div
            style={{
              fontSize: "36px",
              color: "#d1fae5",
              letterSpacing: "-0.01em",
              lineHeight: 1.4,
              maxWidth: "900px",
            }}
          >
            Free Take-Home Pay Calculator for 9 Countries
          </div>

          {/* URL */}
          <div
            style={{
              fontSize: "28px",
              color: "#10b981",
              marginTop: "40px",
              fontWeight: "600",
            }}
          >
            salaryaftertax.net
          </div>
        </div>

        {/* Accent bar at bottom */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: "8px",
            background: "linear-gradient(90deg, #10b981 0%, #047857 100%)",
          }}
        />
      </div>
    ),
    { ...size }
  );
}
