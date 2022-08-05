export type PrimaryKeyConstraint<Name extends string | null> = { $type: "PrimaryKeyConstraint", name: Name };
export type NotNullConstraint<Name extends string | null>    = { $type: "NotNullConstraint",    name: Name };
export type UniqueConstraint<Name extends string | null>     = { $type: "UniqueConstraint",     name: Name };
export type DefaultConstraint<Name extends string | null>    = { $type: "DefaultConstraint",    name: Name };

export type TableIdentifier<
  Schema extends string | null,
  Table extends string,
> = {
  $type: "TableIdentifier",
  schema: Schema,
  table: Table,
};

export type DataType<
  Type extends string,
  Args extends string[] = [],
> = {
  $type: "DataType",
  type: Type,
  args: Args,
};

export type ColumnConstraint<Name extends string | null> =
  | PrimaryKeyConstraint<Name>
  | NotNullConstraint<Name>
  | UniqueConstraint<Name>
  | DefaultConstraint<Name>;

export type ColumnDefinition<
  Name extends string,
  Type extends DataType<any, any> | null = null,
  Constraints extends ColumnConstraint<any>[] = [],
> = {
  $type: "ColumnDefinition",
  name: Name,
  type: Type,
  constraints: Constraints,
};

export type ColumnDefinitions<
  Columns extends ColumnDefinition<any, any, any>[]
> = {
  $type: "ColumnDefinitions",
  columns: Columns,
};

export type CreateTableStatement<
  Temporary extends boolean,
  Schema extends string | null,
  Table extends string,
  Columns extends ColumnDefinition<any, any, any>[],
> = {
  $type: "CreateTableStatement",
  temporary: Temporary,
  schema: Schema,
  table: Table,
  columns: Columns,
};

export type BaseNode =
  | TableIdentifier<any, any>
  | DataType<any, any>
  | ColumnConstraint<any>
  | ColumnDefinition<any, any, any>
  | ColumnDefinitions<any>
  | CreateTableStatement<any, any, any, any>;
