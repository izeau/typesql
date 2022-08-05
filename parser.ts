import {
  type Push,
  type Shift,
  type Tail,
} from "./utils";

import {
  type Constraints
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
  type BaseNode,
  type ColumnConstraint,
  type ColumnDefinition,
  type CreateTableStatement,
  type DataType,
  type DefaultConstraint,
  type NotNullConstraint,
  type PrimaryKeyConstraint,
  type UniqueConstraint,
} from "./ast";

// create ...
// create temporary | temp ...
type ParseCreateTableStatement<
  TokenList extends Token[],
> = TokenList[0] extends KeywordToken<"create">
  ? TokenList[1] extends KeywordToken<"temporary" | "temp">
    ? ParseCreateTableStatementHelper1<Shift<TokenList, 2>, true>
    : ParseCreateTableStatementHelper1<Tail<TokenList>, false>
  : ParseError<ParsingError<TokenList[0]["value"]>>;

// ... table ...
// ... table if not exists ...
type ParseCreateTableStatementHelper1<
  TokenList extends Token[],
  Temporary extends boolean,
> = TokenList[0] extends KeywordToken<"table">
  ? [TokenList[1], TokenList[2], TokenList[3]] extends [KeywordToken<"if">, KeywordToken<"not">, KeywordToken<"exists">]
    ? ParseCreateTableStatementHelper2<Shift<TokenList, 4>, Temporary>
    : ParseCreateTableStatementHelper2<Tail<TokenList>, Temporary>
  : null;

// ... <schema>.<table> ...
// ... <table> ...
type ParseCreateTableStatementHelper2<
  TokenList extends Token[],
  Temporary extends boolean,
> = [TokenList[0], TokenList[1], TokenList[2]] extends [SymbolToken<infer Schema>, GenericToken<".">, SymbolToken<infer Table>]
  ? ParseCreateTableStatementHelper3<Shift<TokenList, 3>, Temporary, Schema, Table>
  : TokenList[0] extends SymbolToken<infer Table>
  ? ParseCreateTableStatementHelper3<Tail<TokenList>, Temporary, null, Table>
  : ParseError<ParsingError<"expected table name">>;

// ... ( ...
type ParseCreateTableStatementHelper3<
  TokenList extends Token[],
  Temporary extends boolean,
  Schema extends string | null,
  Table extends string,
> = TokenList[0] extends GenericToken<"(">
  ? ParseColumnDefinitions<Tail<TokenList>> extends ParseArrayResult<infer Columns, infer TokenList, infer Error>
    ? Error extends ParsingError<any>
      ? ParseError<Error>
      : Columns extends ColumnDefinition<any, any, any>[]
        ? ParseResult<CreateTableStatement<Temporary, Schema, Table, Columns>, TokenList>
        : never
    : never
  : ParseError<ParsingError<"expected '('">>

type ParseColumnDefinitions<
  TokenList extends Token[],
  Result extends ColumnDefinition<any, any, any>[] = [],
  NeedComma extends boolean = false,
> = TokenList[0] extends GenericToken<")">
  ? ParseArrayResult<Result, Tail<TokenList>>
  : TokenList extends []
  ? ParseError<ParsingError<"expected ')'">>
  : NeedComma extends true
  ? TokenList[0] extends GenericToken<",">
    ? ParseColumnDefinitions<Tail<TokenList>, Result>
    : ParseError<ParsingError<"expected ','">>
  : ParseColumnDefinition<TokenList, Result>;

type ParseColumnDefinition<
  TokenList extends Token[],
  Result extends ColumnDefinition<any, any, any>[],
> = TokenList[0] extends SymbolToken<infer Name>
  ? TokenList[1] extends GenericToken<"," | ")">
    ? ParseColumnDefinitions<Tail<TokenList>, Push<Result, ColumnDefinition<Name>>, true>
    : TokenList[1] extends KeywordToken<Constraints>
    ? ParseColumnDefinitionHelper<Tail<TokenList>, Result, Name>
    : ParseDataType<Tail<TokenList>> extends ParseResult<infer Type, infer TokenList, infer Error>
      ? Error extends ParsingError<any>
        ? ParseError<Error>
        : Type extends DataType<any, any>
        ? ParseColumnDefinitionHelper<TokenList, Result, Name, Type>
        : never
      : ParseError<ParsingError<"expected data type">>
  : ParseError<ParsingError<`expected column name (got: '${TokenList[0]["value"]}')`>>;

type ParseColumnDefinitionHelper<
  TokenList extends Token[],
  Result extends ColumnDefinition<any, any, any>[],
  Name extends string,
  Type extends DataType<any> | null = null,
> = ParseConstraints<TokenList> extends ParseArrayResult<infer ColumnConstraints, infer TokenList, infer Error>
  ? Error extends ParsingError<any>
    ? ParseError<Error>
    : ColumnConstraints extends ColumnConstraint<any>[]
    ? ParseColumnDefinitions<TokenList, Push<Result, ColumnDefinition<Name, Type, ColumnConstraints>>, true>
    : never
  : ParseError<ParsingError<"expected constraint">>;

type ParseDataType<
  TokenList extends Token[],
  Result extends string = "",
> = TokenList[0] extends GenericToken<"," | ")"> | KeywordToken<Constraints>
  ? ParseResult<DataType<Result>, TokenList>
  : TokenList[0] extends SymbolToken<infer Type>
  ? ParseDataType<Tail<TokenList>, Uppercase<Result extends "" ? Type : `${Result} ${Type}`>>
  : TokenList[0] extends GenericToken<"(">
  ? Result extends ""
    ? ParseError<ParsingError<"arguments must be preceded by a type">>
    : ParseDataTypeArgs<Tail<TokenList>, Result>
  : ParseError<ParsingError<"expected constraint, symbol or end of column definition">>

type ParseDataTypeArgs<
  TokenList extends Token[],
  BaseType extends string,
  Args extends string[] = [],
  NeedComma extends boolean = false,
> = TokenList[0] extends GenericToken<")">
  ? NeedComma extends false
    ? ParseError<ParsingError<"expected argument">>
    : ParseResult<DataType<BaseType, Args>, Tail<TokenList>>
  : TokenList[0] extends GenericToken<",">
  ? NeedComma extends true
    ? ParseDataTypeArgs<Tail<TokenList>, BaseType, Args>
    : ParseError<ParsingError<"expected argument">>
  : [TokenList[0], TokenList[1]] extends [GenericToken<infer Sign extends "+" | "-">, NumberToken<infer Value>]
  ? ParseDataTypeArgs<Shift<TokenList, 2>, BaseType, Push<Args, `${Sign extends "+" ? "" : Sign}${Value}`>, true>
  : TokenList[0] extends NumberToken<infer Value>
  ? ParseDataTypeArgs<Tail<TokenList>, BaseType, Push<Args, Value>, true>
  : never

type ParseConstraints<
  TokenList extends Token[],
  Result extends ColumnConstraint<any>[] = [],
  Name extends string | null = null,
> = TokenList[0] extends GenericToken<"," | ")">
  ? ParseArrayResult<Result, TokenList>
  : TokenList[0] extends KeywordToken<"unique">
  ? ParseConstraints<Tail<TokenList>, Push<Result, UniqueConstraint<Name>>>
  : [TokenList[0], TokenList[1]] extends [KeywordToken<"primary">, KeywordToken<"key">]
  ? ParsePrimaryKeyConstraint<Shift<TokenList, 2>, Result, Name>
  : [TokenList[0], TokenList[1]] extends [KeywordToken<"not">, KeywordToken<"null">]
  ? ParseConstraints<Shift<TokenList, 2>, Push<Result, NotNullConstraint<Name>>>
  : [TokenList[0], TokenList[1]] extends [KeywordToken<"default">, NumberToken<any> | StringToken<any> | KeywordToken<"true" | "false">]
  ? ParseConstraints<Shift<TokenList, 2>, Push<Result, DefaultConstraint<Name>>>
  : never;

type ParsePrimaryKeyConstraint<
  TokenList extends Token[],
  Result extends ColumnConstraint<any>[],
  Name extends string | null,
> = [TokenList[0], TokenList[1]] extends [KeywordToken<"asc" | "desc">, KeywordToken<"autoincrement">]
  ? ParseConstraints<Shift<TokenList, 2>, Push<Result, PrimaryKeyConstraint<Name>>>
  : TokenList[0] extends KeywordToken<"asc" | "desc" | "autoincrement">
  ? ParseConstraints<Tail<TokenList>, Push<Result, PrimaryKeyConstraint<Name>>>
  : ParseConstraints<TokenList, Push<Result, PrimaryKeyConstraint<Name>>>;

type ParseResult<
  Node extends BaseNode,
  TokenList extends Token[],
  Error extends ParsingError<any> | null = null,
> = {
  $type: "ParseResult",
  node: Node,
  tokenList: TokenList,
  error: Error,
};

type ParseArrayResult<
  NodeList extends BaseNode[],
  TokenList extends Token[],
  Error extends ParsingError<any> | null = null,
> = {
  $type: "ParseResult";
  node: NodeList;
  tokenList: TokenList;
  error: Error;
};

export type Parse<
  TokenList extends Token[],
  Result extends BaseNode[] = [],
> = TokenList extends []
  ? Result
  : TokenList[0] extends GenericToken<";">
  ? Parse<Tail<TokenList>, Result>
  : ParseStatement<TokenList> extends ParseResult<infer Node, infer TokenList, infer Error>
  ? Error extends ParsingError<any>
    ? Error
    : Parse<TokenList, Push<Result, Node>>
  : never;

type ParseStatement<
  TokenList extends Token[],
> = ParseCreateTableStatement<TokenList> extends ParseResult<infer Node, infer TokenList, infer Error>
  ? Error extends ParsingError<any>
    ? ParseError<Error>
    : ParseResult<Node, TokenList>
  : ParseError<ParsingError<"unknown statement">>;

export type ParsingError<Message extends string> = { message: Message };
type ParseError<Error extends ParsingError<any>> = ParseResult<any, any, Error>;
