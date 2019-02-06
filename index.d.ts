import { IResolvers } from 'graphql-tools/dist/Interfaces';

interface Options {
  ignore?: string | string[];
  mode?: 'js' | 'ts' | string;
}

interface Result {
  schema: string;
  resolver: IResolvers;
}

declare function glue(schemaFolderPath: string, options?: Options): Result;

export = glue;
