export interface JusetsuData {
  // 物件の表示
  propertyName: string;
  address: string;
  roomNumber: string;
  layout: string;
  structure: string;
  area: string;

  // 登記簿
  owner: string;
  mortgage: string;

  // 法令上の制限
  zoning: string;

  // インフラ
  water: string;
  electricity: string;
  gas: string;
  drainage: string;

  // 設備
  kitchen: string;
  bathroom: string;
  toilet: string;
  aircon: string;
  otherEquipment: string;

  // 賃料等
  rent: string;
  managementFee: string;
  deposit: string;
  keyMoney: string;
  otherFees: string;

  // 契約期間
  contractStart: string;
  contractEnd: string;
  renewalCondition: string;

  // ハザードマップ
  floodRisk: string;
  landslideRisk: string;
  tsunamiRisk: string;

  // 耐震・石綿
  earthquakeResistance: string;
  asbestos: string;

  // 契約解除
  cancellationTerms: string;
  penalty: string;

  // 特約
  specialTerms: string;

  // 管理会社
  managementCompany: string;
  landlordName: string;
}

export const defaultJusetsuData: JusetsuData = {
  propertyName: "",
  address: "",
  roomNumber: "",
  layout: "",
  structure: "",
  area: "",
  owner: "",
  mortgage: "",
  zoning: "",
  water: "",
  electricity: "",
  gas: "",
  drainage: "",
  kitchen: "",
  bathroom: "",
  toilet: "",
  aircon: "",
  otherEquipment: "",
  rent: "",
  managementFee: "",
  deposit: "",
  keyMoney: "",
  otherFees: "",
  contractStart: "",
  contractEnd: "",
  renewalCondition: "",
  floodRisk: "",
  landslideRisk: "",
  tsunamiRisk: "",
  earthquakeResistance: "",
  asbestos: "",
  cancellationTerms: "",
  penalty: "",
  specialTerms: "",
  managementCompany: "",
  landlordName: "",
};
