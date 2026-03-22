import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 180,
          height: 180,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #3b82f6, #1d4ed8)",
          borderRadius: 40,
        }}
      >
        <span
          style={{
            fontSize: 120,
            fontWeight: 900,
            color: "white",
            fontFamily: "Arial, sans-serif",
            lineHeight: 1,
          }}
        >
          $
        </span>
      </div>
    ),
    { ...size }
  );
}
