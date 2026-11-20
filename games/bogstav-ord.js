// Copied from the PC game (~/Dropbox/Adam-spil/bogstavleg/ord.js): keep the two in step, and copy lyd/ord/*.mp3
// to games/bogstav-lyd/ord/ when words are added.
// Words for "Stav et ord". Edit freely: one word per line, keep the quotes and commas.
// Only letters from the Danish ABC song work (no W). Each word's recording is lyd/ord/<file>.mp3, where <file> is
// the word in lowercase with æ ø å written ae oe aa (Mathæus → mathaeus.mp3, Æble → aeble.mp3).
// Record them in this order (names first, then things): see the README.

// Names. A picture is optional: [name, emoji].
const ORD_NAVNE = [
  ['Adam', '👦'],
  ['Mor', '👩'],
  ['Far', '👨'],
  ['Kira'],
  ['Martin'],
  ['Elli'],
  ['Janni'],
  ['Mikkel'],
  ['John'],
  ['Kirsten'],
  ['Asta'],
  ['Marie'],
  ['Torben'],
  ['Marianne'],
  ['Magnus'],
  ['Signe'],
  ['Kurt'],
  ['Karen'],
  ['Sillas'],
  ['Maria'],
  ['Storm'],
  ['Tristan'],
  ['Heidi'],
  ['Adrian'],
  ['Mathæus'],
  ['Emily'],
  ['Isolde'],
  ['Andrea'],
  ['Johannes'],
  ['Elisabeth'],
  ['Lene'],
  ['Camilla'],
  ['Jessica'],
  ['Kit'],
  ['Judith'],
  ['Isaak'],
  ['Vilfred'],
];

// Things he knows, each with a picture.
const ORD_TING = [
  // animals
  ['Kat', '🐱'], ['Hund', '🐶'], ['Ko', '🐮'], ['Gris', '🐷'], ['Hest', '🐴'], ['Får', '🐑'],
  ['And', '🦆'], ['Høne', '🐔'], ['Mus', '🐭'], ['Kanin', '🐰'], ['Fisk', '🐟'], ['Frø', '🐸'],
  ['Abe', '🐵'], ['Løve', '🦁'], ['Tiger', '🐯'], ['Bjørn', '🐻'], ['Elefant', '🐘'], ['Giraf', '🦒'],
  ['Zebra', '🦓'], ['Ugle', '🦉'], ['Haj', '🦈'], ['Slange', '🐍'], ['Snegl', '🐌'], ['Bi', '🐝'],
  ['Drage', '🐉'], ['Dino', '🦖'],
  // things that go
  ['Bil', '🚗'], ['Bus', '🚌'], ['Tog', '🚂'], ['Fly', '✈️'], ['Båd', '⛵'], ['Traktor', '🚜'],
  ['Raket', '🚀'], ['Cykel', '🚲'],
  // food
  ['Æble', '🍎'], ['Banan', '🍌'], ['Pære', '🍐'], ['Æg', '🥚'], ['Ost', '🧀'], ['Brød', '🍞'],
  ['Mælk', '🥛'], ['Is', '🍦'], ['Kage', '🎂'], ['Pizza', '🍕'],
  // everything else
  ['Bold', '⚽'], ['Bamse', '🧸'], ['Ballon', '🎈'], ['Tromme', '🥁'], ['Bog', '📖'], ['Sko', '👟'],
  ['Ske', '🥄'], ['Hus', '🏠'], ['Sol', '☀️'], ['Måne', '🌙'], ['Stjerne', '⭐'], ['Blomst', '🌸'],
  ['Træ', '🌳'], ['Hjerte', '❤️'],
];

// How much more often a word comes up than the rest (which count 1).
const ORD_VAEGT = { Adam: 6, Mor: 6, Far: 6 };

export { ORD_NAVNE, ORD_TING, ORD_VAEGT };
