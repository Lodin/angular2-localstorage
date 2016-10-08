declare var System: any;
declare var require: any;

declare module 'assign-deep' {
  const assign: (target: any, ...sources: any[]) => boolean;
  export = assign;
}