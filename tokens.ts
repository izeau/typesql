export type GenericToken<Value extends string>  = { $type: "Generic",  value: Value };
export type KeywordToken<Value extends string>  = { $type: "Keyword",  value: Value };
export type NumberToken<Value extends string>   = { $type: "Number",   value: Value };
export type StringToken<Value extends string>   = { $type: "String",   value: Value };
export type SymbolToken<Value extends string>   = { $type: "Symbol",   value: Value };

export type Token<Value extends string = string> =
  | GenericToken<Value>
  | KeywordToken<Value>
  | NumberToken<Value>
  | StringToken<Value>
  | SymbolToken<Value>;
