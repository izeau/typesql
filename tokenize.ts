import {
  type Keywords,
  type Numbers,
  type Symbols,
} from "./constants";

import {
  type GenericToken,
  type KeywordToken,
  type NumberToken,
  type StringToken,
  type SymbolToken,
  type Token,
} from "./tokens";

import {
  type Consume,
  type Peek,
  type Push,
} from "./utils";


type TokenizeInput<
  Input extends string,
  Head extends string,
  Tail extends string,
> = Head extends "(" | ")" | "," | "." | ";" |"+" | "-"
  ? [GenericToken<Head>, Tail]
  : Head extends Numbers
  ? TokenizeNumber<Input, "", Head>
  : Head extends '"'
  ? TokenizeString<Tail, '"'>
  : Head extends "'"
  ? TokenizeString<Tail, "'">
  : Head extends Symbols
  ? TokenizeSymbol<Input, "", Head>
  : never;

type TokenizeNumber<
  Input extends string,
  Result extends string,
  Head extends string = Peek<Input>,
> = Head extends Numbers
  ? TokenizeNumber<Consume<Input>, `${Result}${Head}`>
  : [NumberToken<Result>, Input];

type TokenizeString<
  Input extends string,
  QuoteType extends '"' | "'",
> = Input extends `${infer Before}${QuoteType}${infer After}`
  ? [StringToken<Before>, After]
  : never

type TokenizeSymbol<
  Input extends string,
  Result extends string,
  Head extends string = Peek<Input>,
> = Head extends Symbols
  ? TokenizeSymbol<Consume<Input>, `${Result}${Head}`>
  : [
      Lowercase<Result> extends infer LowercaseResult
        ? LowercaseResult extends Keywords
          ? KeywordToken<LowercaseResult>
          : SymbolToken<Result>
        : never,
      Input
    ];

type TokenizeHelper<
  TokenizeResult,
  Result extends any[],
> = TokenizeResult extends any[]
  ? Tokenize<
      TokenizeResult[1],
      Push<Result, TokenizeResult[0]>
    >
  : TokenizeResult

export type Tokenize<
  Input extends string,
  Result extends Token<string>[] = [],
  Head extends string = Peek<Input>,
  Tail extends string = Consume<Input>,
> = Input extends ""
  ? Result
  : Head extends " "
  ? Tokenize<Tail, Result>
  : Input extends `-- ${any}\n${infer Rest}`
  ? Tokenize<Rest, Result>
  : Head extends "\n"
  ? Tokenize<Tail, Result>
  : TokenizeInput<Input, Head, Tail> extends infer TokenizeResult
  ? TokenizeHelper<TokenizeResult, Result>
  : never;
