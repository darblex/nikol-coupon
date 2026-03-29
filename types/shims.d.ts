declare module "better-sqlite3" {
  export interface Statement<T = any> {
    run(...params: any[]): any;
    get(...params: any[]): T | undefined;
    all(...params: any[]): T[];
  }

  export default class Database {
    constructor(path?: string);
    prepare<T = any>(sql: string): Statement<T>;
    pragma(cmd: string): void;
    exec(sql: string): void;
  }

  export namespace Database {
    export type Database = import("better-sqlite3").default;
  }
}

declare module "cheerio" {
  export type Element = any;
  export type CheerioAPI = any;
  export function load(html: string): CheerioAPI;
}
