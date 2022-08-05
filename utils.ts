export type Peek<T> = T extends `${infer Head}${any}` ? Head : "";
export type Consume<T> = T extends `${any}${infer Tail}` ? Tail : "";
export type Tail<T extends any[]> = ((...items: T) => void) extends (head: any, ...rest: infer R) => void ? R : never;
export type Push<A extends any[], B> = [...A, B];
export type Shift<T extends any[], B extends number, A extends any[] = []> = B extends A["length"] ? T : Shift<Tail<T>, B, Push<A, 0>>;
export type Expand<T> = { [K in keyof T]: T[K] };
