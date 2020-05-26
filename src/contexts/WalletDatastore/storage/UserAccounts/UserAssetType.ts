export type UserAssetType = {
  _id?: string; // Why is this optional from standard example?
  free: number;
  frozen: number; // This is a nested objet. TODO: Add types
  locked: number;
  symbol: string;
  full?:number
}

