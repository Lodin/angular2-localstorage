export type SerealizationRule = {
  serealize: (deserealized: any) => string;
  deserialize: (serealized: string) => any;
};
