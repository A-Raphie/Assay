import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Assay: your agent places the trade, your rules make the call";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          background: "#181A20",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            color: "#F0B90B",
            fontSize: 26,
            letterSpacing: 8,
            fontFamily: "monospace",
          }}
        >
          THE CHECK BEFORE THE ORDER
        </div>
        <div
          style={{
            marginTop: 24,
            display: "flex",
            color: "#EAECEF",
            fontSize: 72,
            fontWeight: 700,
            lineHeight: 1.1,
            maxWidth: 1000,
          }}
        >
          Your agent places the trade. Your rules make the call.
        </div>
        <div
          style={{
            marginTop: 28,
            display: "flex",
            color: "#929AA5",
            fontSize: 30,
            fontFamily: "monospace",
          }}
        >
          Assay · pre-trade checks for Binance Agent OS
        </div>
        <div style={{ marginTop: 28, display: "flex", gap: 12 }}>
          {["PASSED", "RESIZED", "BLOCKED", "HALTED"].map((w, i) => (
            <div
              key={w}
              style={{
                display: "flex",
                border: `3px solid ${i === 0 ? "#2EBD85" : i === 1 ? "#F0B90B" : "#F6465D"}`,
                color: i === 0 ? "#2EBD85" : i === 1 ? "#F0B90B" : "#F6465D",
                borderRadius: 4,
                padding: "6px 14px",
                fontSize: 28,
                fontFamily: "monospace",
                fontWeight: 700,
                transform: `rotate(${i % 2 === 0 ? -4 : 3}deg)`,
              }}
            >
              {w}
            </div>
          ))}
        </div>
      </div>
    ),
    size,
  );
}
