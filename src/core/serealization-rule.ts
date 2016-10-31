export type SerializationRule = {
  serialize: (deserialized: any) => string;
  deserialize: (serialized: string) => any;
};
