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
      }}
    >
      <GameCanvas />
    </main>
  );
}
