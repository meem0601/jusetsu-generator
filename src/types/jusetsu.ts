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
  floodMapImage: string;
  landslideMapImage: string;
  tsunamiMapImage: string;

  // 耐震・石綿
  earthquakeResistance: string;
  asbestos: string;

  // 契約解除
  cancellationTerms: string;
  penalty: string;

  // 特約事項（詳細）
  earlyTerminationPenalty: string;
  cleaningFee: string;
  keyChangeFee: string;
  noticePeriod: string;
  rentProrationOnCancel: string;
  petPolicy: string;
  instrumentPolicy: string;
  restorationObligation: string;
  insuranceRequirement: string;
  guarantorInfo: string;
  parking: string;
  internet: string;
  prohibitedItems: string;
  keyCount: string;
  renewalProcedure: string;
  otherSpecialTerms: string;

  // 物件追加情報
  builtDate: string;
  stories: string;
  floor: string;

  // 借主情報
  tenantName: string;
  tenantAddress: string;

  // 支払い情報
  paymentDeadline: string;
  paymentMethod: string;

  // 仲介
  brokerName: string;
  brokerLicense: string;
  tradingOfficerName: string;

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
  floodMapImage: "",
  landslideMapImage: "",
  tsunamiMapImage: "",
  earthquakeResistance: "",
  asbestos: "",
  cancellationTerms: "",
  penalty: "",
  earlyTerminationPenalty: "",
  cleaningFee: "",
  keyChangeFee: "",
  noticePeriod: "",
  rentProrationOnCancel: "",
  petPolicy: "",
  instrumentPolicy: "",
  restorationObligation: "",
  insuranceRequirement: "",
  guarantorInfo: "",
  parking: "",
  internet: "",
  prohibitedItems: "",
  keyCount: "",
  renewalProcedure: "",
  otherSpecialTerms: "",
  builtDate: "",
  stories: "",
  floor: "",
  tenantName: "",
  tenantAddress: "",
  paymentDeadline: "",
  paymentMethod: "",
  brokerName: "",
  brokerLicense: "",
  tradingOfficerName: "",
  managementCompany: "",
  landlordName: "",
};
