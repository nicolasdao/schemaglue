interface Token {
  comment: string;
  value: string;
}

interface Schema {
  types: SchemaPart;
  query: SchemaPart;
  mutation: SchemaPart;
  subscription: SchemaPart;
}

interface SchemaPart {
  raw: string;
  body: string;
}

export function removeComments(
  schema: string
): { schema: string; tokens: Token[] };

export declare function findClosingCharacter(
  str: string,
  openChar: string,
  closingChar: string,
  skip?: number
): number;

export declare function getSchemaParts(schema: string): Schema;

export declare function mergeSchemas(...schemas: string[]): string;
