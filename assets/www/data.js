/* ------------------------------------------------------------------
   Gitanjali Cinema Hall - catalogue data
   DEMO DATA. Replace the movies / shows below with the real schedule.
   Prices are in rupees (per ticket).
   ------------------------------------------------------------------ */
window.GJ = {
  hall: {
    name: "Gitanjali Cinema Hall",
    nameBn: "গীতাঞ্জলি সিনেমা হল",
    place: "Santiniketan, Birbhum",
    screens: "Single Screen · 2 Shows Daily + Matinee"
  },

  movies: [
    {
      id: "m1",
      title: "Shonar Tori",
      titleBn: "শোনার তরী",
      lang: "Bengali", cert: "U", dur: "2h 06m",
      genre: "Family · Drama",
      rating: 8.2,
      c1: "#7a1220", c2: "#2a0d14",
      blurb: "A boatman's daughter dreams of a school across the river."
    },
    {
      id: "m2",
      title: "Brishti Elo",
      titleBn: "বৃষ্টি এলো",
      lang: "Bengali", cert: "U/A", dur: "1h 58m",
      genre: "Romance · Monsoon",
      rating: 7.6,
      c1: "#123a4a", c2: "#0a1c24",
      blurb: "Two strangers share an umbrella and a whole monsoon in Bolpur."
    },
    {
      id: "m3",
      title: "Chhaya Rekha",
      titleBn: "ছায়া রেখা",
      lang: "Bengali", cert: "A", dur: "2h 14m",
      genre: "Thriller",
      rating: 8.0,
      c1: "#2b2b46", c2: "#12121f",
      blurb: "A village photographer finds a face in every negative."
    },
    {
      id: "m4",
      title: "Kopai Express",
      titleBn: "কোপাই এক্সপ্রেস",
      lang: "Hindi", cert: "U/A", dur: "2h 22m",
      genre: "Action · Comedy",
      rating: 7.1,
      c1: "#4a3410", c2: "#1c1305",
      blurb: "A ticket collector, a missing bag, and one very late train."
    }
  ],

  /* One entry per show slot. stalls / balcony = price per seat. */
  shows: [
    { id: "s1", time: "11:00 AM", slot: "matinee", stalls: 40, balcony: 60 },
    { id: "s2", time: "2:30 PM",  slot: "day",     stalls: 50, balcony: 70 },
    { id: "s3", time: "6:15 PM",  slot: "evening", stalls: 60, balcony: 80 },
    { id: "s4", time: "9:15 PM",  slot: "night",   stalls: 50, balcony: 70 }
  ],

  /* Which films are running in which slot. */
  schedule: {
    m1: ["s1", "s3"],
    m2: ["s2", "s4"],
    m3: ["s3", "s4"],
    m4: ["s1", "s2"]
  },

  /* Hall layout: stalls A-F (12 seats), balcony G-H (10 seats). */
  rows: [
    { id: "A", kind: "stalls", seats: 12 },
    { id: "B", kind: "stalls", seats: 12 },
    { id: "C", kind: "stalls", seats: 12 },
    { id: "D", kind: "stalls", seats: 12 },
    { id: "E", kind: "stalls", seats: 12 },
    { id: "F", kind: "stalls", seats: 12 },
    { id: "G", kind: "balcony", seats: 10 },
    { id: "H", kind: "balcony", seats: 10 }
  ],

  maxSeats: 6
};
