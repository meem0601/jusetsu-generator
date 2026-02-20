export interface BrokerInfo {
  licenseNumber: string;
  officeAddress: string;
  phone: string;
  companyName: string;
  representative: string;
}

export interface TradingOfficerInfo {
  registrationNumber: string;
  name: string;
  officeName: string;
  officeAddress: string;
  phone: string;
}

export interface EquipmentItem {
  exists: boolean;
  detail: string;
}

export interface ManagerInfo {
  name: string;
  address: string;
  phone: string;
  person: string;
  registrationNumber: string;
}

export interface InfraItem {
  available: boolean;
  provider: string;
  remarks: string;
}

export interface JusetsuData {
  // === ヘッダー ===
  documentType: string;

  // === 当事者 ===
  borrowerName: string;
  lenderName: string;

  // === 取引態様 ===
  transactionType: string;

  // === 宅地建物取引業者 ===
  broker1: BrokerInfo;
  broker2: BrokerInfo;

  // === 説明をする宅地建物取引士 ===
  tradingOfficer1: TradingOfficerInfo;
  tradingOfficer2: TradingOfficerInfo;

  // === 保証協会 ===
  guaranteeAssociation: {
    name: string;
    address: string;
    localBranch: string;
    localBranchAddress: string;
    depositOffice: string;
    depositOfficeAddress: string;
  };

  // === A. 建物の表示 ===
  building: {
    name: string;
    addressDisplay: string;
    addressRegistry: string;
    type: string;
    structure: string;
    floorArea: string;
    layout: string;
    builtDate: string;
  };

  // === B. 貸主の表示 ===
  landlord: {
    sameAsOwner: boolean;
    address: string;
    name: string;
    remarks: string;
  };

  // === Ⅰ-1. 登記記録 ===
  registry: {
    ownerAddress: string;
    ownerName: string;
    ownershipRights: boolean;
    ownershipRightsDetail: string;
    otherRights: boolean;
    otherRightsDetail: string;
  };

  // === Ⅰ-2. 法令に基づく制限 ===
  legalRestrictions: string;

  // === Ⅰ-3. インフラ ===
  infrastructure: {
    water: InfraItem;
    electricity: InfraItem;
    gas: InfraItem & { type: string };
    drainage: InfraItem & { type: string };
  };

  // === Ⅰ-5. 建物状況調査 ===
  buildingInspection: {
    applicable: boolean;
    conducted: boolean;
    summary: string;
  };

  // === Ⅰ-6. 設備の整備状況 ===
  equipment: {
    electricity: EquipmentItem;
    gas: EquipmentItem;
    stove: EquipmentItem;
    waterSupply: EquipmentItem;
    sewage: EquipmentItem;
    kitchen: EquipmentItem;
    toilet: EquipmentItem;
    bathroom: EquipmentItem;
    washstand: EquipmentItem;
    laundry: EquipmentItem;
    hotWater: EquipmentItem;
    aircon: EquipmentItem;
    lighting: EquipmentItem;
    furniture: EquipmentItem;
    digitalTV: EquipmentItem;
    catv: EquipmentItem;
    internet: EquipmentItem;
    trunkRoom: EquipmentItem;
    garden: EquipmentItem;
    roofBalcony: EquipmentItem;
    keys: EquipmentItem;
  };

  // === 共用設備 ===
  commonFacilities: {
    elevator: EquipmentItem;
    autoLock: EquipmentItem;
    mailbox: EquipmentItem;
    deliveryBox: EquipmentItem;
    trunkRoom: EquipmentItem;
    parking: EquipmentItem;
    bicycle: EquipmentItem;
    bikeParking: EquipmentItem;
  };

  // === Ⅰ-7〜9. 防災区域 ===
  hazardZones: {
    developedLandDisasterZone: boolean;
    landslideWarningZone: boolean;
    landslideSpecialZone: boolean;
    tsunamiWarningZone: boolean;
    tsunamiSpecialZone: boolean;
  };

  // === Ⅰ-10. ハザードマップ ===
  hazardMap: {
    floodExists: boolean;
    floodDetail: string;
    stormWaterExists: boolean;
    stormWaterDetail: string;
    stormSurgeExists: boolean;
    stormSurgeDetail: string;
  };

  // === Ⅰ-11. 石綿 ===
  asbestos: {
    inquiryTarget: string;
    recordExists: boolean;
    detail: string;
  };

  // === Ⅰ-12. 耐震 ===
  earthquake: {
    applicable: boolean;
    diagnosisExists: boolean;
    detail: string;
  };

  // === Ⅱ-1. 賃料・費用 ===
  financials: {
    rent: number;
    managementFee: number;
    deposit: number;
    keyMoney: number;
    otherFees: Array<{ name: string; amount: string }>;
    paymentDeadline: string;
    paymentMethod: string;
    bankInfo: string;
  };

  // === Ⅱ-2. 契約解除 ===
  cancellation: string;

  // === Ⅱ-3. 違約金 ===
  penalty: {
    exists: boolean;
    detail: string;
  };

  // === Ⅱ-4. 保全措置 ===
  securityMeasure: {
    provided: boolean;
    detail: string;
  };

  // === Ⅱ-5. 契約期間・更新 ===
  contract: {
    type: string;
    startDate: string;
    endDate: string;
    periodYears: number;
    renewalTerms: string;
    renewalFee: string;
    renewalAdminFee: string;
  };

  // === Ⅱ-6. 用途制限 ===
  usageRestrictions: {
    purpose: string;
    petPolicy: string;
    instrumentPolicy: string;
    renovationPolicy: string;
    other: string;
  };

  // === Ⅱ-7. 敷金精算 ===
  depositSettlement: string;

  // === Ⅱ-8. 管理委託先 ===
  management: {
    buildingManager: ManagerInfo;
    propertyManager: ManagerInfo;
  };

  // === Ⅲ. その他重要な事項 ===
  otherImportantMatters: string;

  // === Ⅳ. 添付書類 ===
  attachments: string[];

  // === Ⅴ. 備考 ===
  remarks: string;

  // === ハザードマップ画像 ===
  floodMapImage: string;
  landslideMapImage: string;
  tsunamiMapImage: string;
}

const defaultEquipment: EquipmentItem = { exists: false, detail: "" };
const defaultBroker: BrokerInfo = { licenseNumber: "", officeAddress: "", phone: "", companyName: "", representative: "" };
const defaultOfficer: TradingOfficerInfo = { registrationNumber: "", name: "", officeName: "", officeAddress: "", phone: "" };
const defaultManager: ManagerInfo = { name: "", address: "", phone: "", person: "", registrationNumber: "" };
const defaultInfra: InfraItem = { available: false, provider: "", remarks: "" };

export const defaultJusetsuData: JusetsuData = {
  documentType: "51-1. 居住用建物／普通賃貸借契約〔連帯保証人型〕",
  borrowerName: "",
  lenderName: "",
  transactionType: "媒介",
  broker1: { ...defaultBroker },
  broker2: { ...defaultBroker },
  tradingOfficer1: { ...defaultOfficer },
  tradingOfficer2: { ...defaultOfficer },
  guaranteeAssociation: {
    name: "",
    address: "",
    localBranch: "",
    localBranchAddress: "",
    depositOffice: "",
    depositOfficeAddress: "",
  },
  building: {
    name: "",
    addressDisplay: "",
    addressRegistry: "",
    type: "マンション",
    structure: "",
    floorArea: "",
    layout: "",
    builtDate: "",
  },
  landlord: {
    sameAsOwner: true,
    address: "",
    name: "",
    remarks: "",
  },
  registry: {
    ownerAddress: "",
    ownerName: "",
    ownershipRights: false,
    ownershipRightsDetail: "",
    otherRights: false,
    otherRightsDetail: "",
  },
  legalRestrictions: "",
  infrastructure: {
    water: { ...defaultInfra },
    electricity: { ...defaultInfra },
    gas: { ...defaultInfra, type: "" },
    drainage: { ...defaultInfra, type: "" },
  },
  buildingInspection: {
    applicable: false,
    conducted: false,
    summary: "",
  },
  equipment: {
    electricity: { ...defaultEquipment },
    gas: { ...defaultEquipment },
    stove: { ...defaultEquipment },
    waterSupply: { ...defaultEquipment },
    sewage: { ...defaultEquipment },
    kitchen: { ...defaultEquipment },
    toilet: { ...defaultEquipment },
    bathroom: { ...defaultEquipment },
    washstand: { ...defaultEquipment },
    laundry: { ...defaultEquipment },
    hotWater: { ...defaultEquipment },
    aircon: { ...defaultEquipment },
    lighting: { ...defaultEquipment },
    furniture: { ...defaultEquipment },
    digitalTV: { ...defaultEquipment },
    catv: { ...defaultEquipment },
    internet: { ...defaultEquipment },
    trunkRoom: { ...defaultEquipment },
    garden: { ...defaultEquipment },
    roofBalcony: { ...defaultEquipment },
    keys: { ...defaultEquipment },
  },
  commonFacilities: {
    elevator: { ...defaultEquipment },
    autoLock: { ...defaultEquipment },
    mailbox: { ...defaultEquipment },
    deliveryBox: { ...defaultEquipment },
    trunkRoom: { ...defaultEquipment },
    parking: { ...defaultEquipment },
    bicycle: { ...defaultEquipment },
    bikeParking: { ...defaultEquipment },
  },
  hazardZones: {
    developedLandDisasterZone: false,
    landslideWarningZone: false,
    landslideSpecialZone: false,
    tsunamiWarningZone: false,
    tsunamiSpecialZone: false,
  },
  hazardMap: {
    floodExists: false,
    floodDetail: "",
    stormWaterExists: false,
    stormWaterDetail: "",
    stormSurgeExists: false,
    stormSurgeDetail: "",
  },
  asbestos: {
    inquiryTarget: "",
    recordExists: false,
    detail: "",
  },
  earthquake: {
    applicable: false,
    diagnosisExists: false,
    detail: "",
  },
  financials: {
    rent: 0,
    managementFee: 0,
    deposit: 0,
    keyMoney: 0,
    otherFees: [],
    paymentDeadline: "",
    paymentMethod: "",
    bankInfo: "",
  },
  cancellation: "",
  penalty: {
    exists: false,
    detail: "",
  },
  securityMeasure: {
    provided: false,
    detail: "",
  },
  contract: {
    type: "普通賃貸借",
    startDate: "",
    endDate: "",
    periodYears: 2,
    renewalTerms: "",
    renewalFee: "",
    renewalAdminFee: "",
  },
  usageRestrictions: {
    purpose: "居住用",
    petPolicy: "",
    instrumentPolicy: "",
    renovationPolicy: "",
    other: "",
  },
  depositSettlement: "",
  management: {
    buildingManager: { ...defaultManager },
    propertyManager: { ...defaultManager },
  },
  otherImportantMatters: "",
  attachments: [],
  remarks: "",
  floodMapImage: "",
  landslideMapImage: "",
  tsunamiMapImage: "",
};
