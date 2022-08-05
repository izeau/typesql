export type Numbers = "0" | "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9";

export type Symbols =
  | "a" | "b" | "c" | "d" | "e" | "f" | "g" | "h" | "i" | "j" | "k" | "l" | "m"
  | "n" | "o" | "p" | "q" | "r" | "s" | "t" | "u" | "v" | "w" | "x" | "y" | "z"
  | "A" | "B" | "C" | "D" | "E" | "F" | "G" | "H" | "I" | "J" | "K" | "L" | "M"
  | "N" | "O" | "P" | "Q" | "R" | "S" | "T" | "U" | "V" | "W" | "X" | "Y" | "Z"
  | "0" | "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "0" | "_" | "$";

export type Constraints =
  | "as"
  | "default"
  | "not"
  | "primary"
  | "unique"

export type Keywords =
  | "as"
  | "asc"
  | "autoincrement"
  | "create"
  | "desc"
  | "exists"
  | "false"
  | "if"
  | "key"
  | "null"
  | "table"
  | "temp"
  | "temporary"
  | "true"
  | "virtual"
  | Constraints;
