import {
  type Expand,
  type Push,
  type Tail,
} from "./utils";

import {
  type Parse,
  type ParsingError,
} from "./parser";

import {
  type Tokenize,
} from "./tokenize";

import {
  type BaseNode,
  type ColumnConstraint,
  type ColumnDefinition,
  type CreateTableStatement,
  type DataType,
  type NotNullConstraint,
} from "./ast";

export type GetTypeOptions = {
  camelCase?: boolean;
};

export type GetType<
  Input extends string,
  Table extends string | [string | null, string],
  Options extends GetTypeOptions = { camelCase: false },
> = Table extends string
  ? GetType<Input, [null, Table], Options>
  : Parse<Tokenize<Input>> extends infer Result
  ? Result extends ParsingError<any>
    ? Result
    : Result extends BaseNode[]
    ? Table extends [string | null, string]
      ? GetTypeHelper1<Result, Table, Options>
      : never
    : never
  : never

type GetTypeHelper1<
  Statements extends BaseNode[],
  Table extends [string | null, string],
  Options extends GetTypeOptions,
> = Statements extends []
  ? ParsingError<`could not find table '${Table[0] extends null ? "" : `${Table[0]}.`}${Table[1]}'`>
  : Statements[0] extends CreateTableStatement<any, Table[0], Table[1], infer Columns>
  ? Expand<{
      [C in Columns[number] as GetTypeHelper2<C, Options, false>]: C extends ColumnDefinition<any, infer Type, any> ? MapDataType<Type> : never
    } & {
      [C in Columns[number] as GetTypeHelper2<C, Options, true>]?: C extends ColumnDefinition<any, infer Type, any> ? MapDataType<Type> | null : never
    }>
  : GetTypeHelper1<Tail<Statements>, Table, Options>;

type GetTypeHelper2<
  Column extends ColumnDefinition<any, any, any>,
  Options extends GetTypeOptions,
  Nullable extends boolean,
> = Column extends ColumnDefinition<infer Name, any, infer Constraints>
  ? IsNullable<Constraints> extends Nullable
    ? Options extends { camelCase: true } ? CamelCase<Name> : Name
    : never
  : never;

type IsNullable<
  Constraints extends ColumnConstraint<any>[],
  Stop extends number[] = [],
> = Constraints extends []
  ? true
  : Stop["length"] extends 50
  ? true
  : Constraints[0] extends NotNullConstraint<any>
  ? false
  : IsNullable<Tail<Constraints>, Push<Stop, 0>>;

type CamelCase<
  Input extends string,
  Result extends string = "",
  UpperNext extends boolean = false,
> = Input extends ""
  ? Result
  : Input extends `${infer Char}${infer Rest}`
  ? Char extends "_"
    ? CamelCase<Rest, Result, true>
    : CamelCase<Rest, `${Result}${UpperNext extends true ? Uppercase<Char> : Char}`, false>
  : never;

type MapDataType<
  Type extends DataType<any, any> | null,
> = Type extends DataType<infer Type, any>

  // https://www.sqlite.org/datatype3.html#determination_of_column_affinity
  ? Type extends `${string}${"INT"                   }${string}`        ? number
  : Type extends `${string}${"CHAR" | "CLOB" | "TEXT"}${string}`        ? string
  : Type extends `${string}${"BLOB"                  }${string}` | null ? Uint8Array
  : Type extends `${string}${"REAL" | "FLOA" | "DOUB"}${string}`        ? number

  // bonus
  : Type extends `${string}${"BOOL"                  }${string}`        ? boolean
  : Type extends `${string}${"TIME" | "DATE"         }${string}`        ? Date

  // fallback
  : number
  : never;
