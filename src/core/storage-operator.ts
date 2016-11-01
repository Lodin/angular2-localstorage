export interface StorageOperator {
  keys: string[];
  get(key: string): any;
  has(key: string): boolean;
  remove(key: string): void;
  set(key: string, value: any): void;
}
