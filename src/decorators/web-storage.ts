export interface WebStorage {
  key?: string;
  serialize?: (deserealized: any) => string;
  deserialize?: (serialized: string) => any;
}