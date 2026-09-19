import mongoose from 'mongoose';

export const getMongoose = (): any => {
  const m = mongoose as any;
  if (m?.model) return m;
  if (m?.default?.model) return m.default;
  return m;
};

export function getOrCreateModel<T>(name: string, schema: any): any {
  const mg = getMongoose();
  if (mg.models && mg.models[name]) {
    return mg.models[name];
  }
  return mg.model(name, schema);
}
