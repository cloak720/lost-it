// A small emoji confetti burst, used when an item is marked as returned.
const EMOJI = ["🎉", "✨", "💛", "🥳", "📦", "🎊"];

export function confetti(x = window.innerWidth / 2, y = window.innerHeight / 2) {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  for (let i = 0; i < 26; i++) {
    const piece = document.createElement("span");
    piece.className = "confetti";
    piece.textContent = EMOJI[i % EMOJI.length];
    piece.style.left = `${x}px`;
    piece.style.top = `${y}px`;
    piece.style.setProperty("--dx", `${(Math.random() * 2 - 1) * 240}px`);
    piece.style.setProperty("--dy", `${-(Math.random() * 220 + 80)}px`);
    piece.style.setProperty("--rot", `${Math.random() * 720 - 360}deg`);
    document.body.appendChild(piece);
    setTimeout(() => piece.remove(), 1400);
  }
}
