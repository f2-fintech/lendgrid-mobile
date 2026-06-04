export type DsaCodeDetails = {
  code: string;
  type: string;
};

export type BankerDirectoryBankOption = {
  _id?: string;
  name?: string;
};

export type BankerDirectoryRow = {
  _id?: string;
  associatedWith?: string;
  bankerName?: string;
  contact?: string;
  emailOfficial?: string;
  emailPersonal?: string;
  product?: string[];
  state?: string[];
  city?: string[];
};

export type BankerDirectoryFilterResponse = {
  data?: BankerDirectoryRow[];
};

export type BankerCardItem = {
  id: string;
  name: string;
  state: string;
  city: string;
  email: string;
  phone: string;
  specialization: string;
  bank: string;
};

export type StateCityMeta = {
  states: string[];
  stateCityMap: Record<string, string[]>;
};

export type SearchStage = "bank" | "state" | "city" | "done";
