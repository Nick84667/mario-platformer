import { GameCanvas } from "@/components/canvas/GameCanvas";

// The root page renders the full-screen game canvas.
// All overlays (menus, HUD) live inside GameCanvas.
export default function Home() {
  return (
    <main
      style={{
        width: "100vw",
        height: "100dvh",
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#000",
        position: "relative",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: "16px",
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 10,
          padding: "8px 14px",
          borderRadius: "999px",
          background: "rgba(34, 197, 94, 0.92)",
          color: "#052e16",
          fontSize: "14px",
          fontWeight: 700,
          fontFamily: "Arial, sans-serif",
          boxShadow: "0 4px 16px rgba(0, 0, 0, 0.35)",
          border: "1px solid rgba(255, 255, 255, 0.35)",
        }}
      >
        CI/CD GitOps Demo · Jenkins → GHCR → ArgoCD → K3s
      </div>

      <GameCanvas />
    </main>
  );
}