/** Tailwind config — palette & motion taken from the invitation card */
module.exports = {
  content: ["./index.html", "./script.js"],
  theme: {
    extend: {
      colors: {
        ivory: "#fbf7ec", sky: "#dbe7f6", powder: "#a9bfe3", hydrangea: "#7f9bd0",
        dusk: "#2f4675", ink: "#26385f", butter: "#f2dc8a", gold: "#c6a15b",
        "gold-deep": "#8e6e2f", rose: "#b5566a"
      },
      fontFamily: {
        fa: ['"Amiri"', '"Cormorant Garamond"', "Georgia", "serif"],
        display: ['"Cormorant Garamond"', '"Amiri"', "Georgia", "serif"],
        ui: ['"Vazirmatn"', "system-ui", "sans-serif"]
      },
      keyframes: {
        bob: { "0%,100%": { transform: "translateY(0) rotate(-1.5deg)" }, "50%": { transform: "translateY(-10px) rotate(1.5deg)" } },
        flicker: { "0%,100%": { opacity: ".95", transform: "scale(1)" }, "40%": { opacity: ".7", transform: "scale(.88,1.06)" }, "70%": { opacity: "1", transform: "scale(1.06,.96)" } },
        inkin: { from: { opacity: "0", filter: "blur(4px)" }, to: { opacity: ".75", filter: "blur(0)" } }
      },
      animation: {
        bob: "bob 6s ease-in-out infinite",
        flicker: "flicker 1.8s ease-in-out infinite",
        inkin: "inkin 1.2s ease forwards"
      }
    }
  },
  plugins: []
};
