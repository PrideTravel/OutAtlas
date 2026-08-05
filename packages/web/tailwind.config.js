/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ['./index.html'],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                "primary": "#f20d8f",
                "background-light": "#f8f5f7",
                "background-dark": "#22101a",
                "pride-red": "#FF0018",
                "pride-orange": "#FFA52C",
                "pride-yellow": "#FFFF41",
                "pride-green": "#008018",
                "pride-blue": "#0000F9",
                "pride-purple": "#86007D",
            },
            fontFamily: {
                "display": ["Outfit", "sans-serif"],
                "sans": ["Outfit", "sans-serif"]
            },
            borderRadius: { "DEFAULT": "1rem", "lg": "2rem", "xl": "3rem", "full": "9999px" },
        }
    },
    plugins: [],
};
