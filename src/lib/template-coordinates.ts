// Template coordinate mapping for 重要事項説明書
// PDF dimensions: 595 x 842 points (A4)
// Coordinate system: bottom-left origin (pdf-lib)
// y values: 842 = top, 0 = bottom

export interface FieldCoord {
  x: number;
  y: number;
  w: number;
  h: number;
  fontSize?: number;
  maxWidth?: number;
}

// Page 1: Header, brokers, trading officers, guarantee association, signatures
export const PAGE1 = {
  // Header - borrower/lender names
  borrowerName: { x: 70, y: 752, w: 230, h: 14, fontSize: 11 },
  lenderName: { x: 385, y: 752, w: 230, h: 14, fontSize: 11 },

  // Transaction type checkboxes - "媒介" check mark area (left side)
  transactionTypeLeftMediation: { x: 110, y: 692, w: 12, h: 12, fontSize: 12 },
  transactionTypeLeftAgent: { x: 175, y: 692, w: 12, h: 12, fontSize: 12 },
  transactionTypeRightMediation: { x: 370, y: 692, w: 12, h: 12, fontSize: 12 },
  transactionTypeRightAgent: { x: 435, y: 692, w: 12, h: 12, fontSize: 12 },

  // 宅地建物取引業者 - Left column (broker1)
  broker1License: { x: 192, y: 660, w: 145, h: 12, fontSize: 8 },
  broker1Address: { x: 192, y: 640, w: 145, h: 24, fontSize: 7, maxWidth: 145 },
  broker1Phone: { x: 192, y: 614, w: 145, h: 12, fontSize: 8 },
  broker1Name: { x: 192, y: 596, w: 145, h: 12, fontSize: 8 },
  broker1Rep: { x: 192, y: 578, w: 145, h: 12, fontSize: 8 },

  // 宅地建物取引業者 - Right column (broker2)
  broker2License: { x: 442, y: 660, w: 145, h: 12, fontSize: 8 },
  broker2Address: { x: 442, y: 640, w: 145, h: 24, fontSize: 7, maxWidth: 145 },
  broker2Phone: { x: 442, y: 614, w: 145, h: 12, fontSize: 8 },
  broker2Name: { x: 442, y: 596, w: 145, h: 12, fontSize: 8 },
  broker2Rep: { x: 442, y: 578, w: 145, h: 12, fontSize: 8 },

  // 説明をする宅地建物取引士 - Left column (officer1)
  officer1RegNumber: { x: 192, y: 546, w: 145, h: 12, fontSize: 8 },
  officer1Name: { x: 192, y: 528, w: 145, h: 12, fontSize: 8 },
  officer1OfficeName: { x: 192, y: 510, w: 145, h: 12, fontSize: 8 },
  officer1OfficeAddress: { x: 192, y: 490, w: 145, h: 24, fontSize: 7, maxWidth: 145 },
  officer1Phone: { x: 192, y: 466, w: 145, h: 12, fontSize: 8 },

  // 説明をする宅地建物取引士 - Right column (officer2)
  officer2RegNumber: { x: 442, y: 546, w: 145, h: 12, fontSize: 8 },
  officer2Name: { x: 442, y: 528, w: 145, h: 12, fontSize: 8 },
  officer2OfficeName: { x: 442, y: 510, w: 145, h: 12, fontSize: 8 },
  officer2OfficeAddress: { x: 442, y: 490, w: 145, h: 24, fontSize: 7, maxWidth: 145 },
  officer2Phone: { x: 442, y: 466, w: 145, h: 12, fontSize: 8 },

  // 保証協会 checkbox
  guaranteeCheckLeft: { x: 102, y: 440, w: 12, h: 12, fontSize: 12 },
  guaranteeCheckRight: { x: 370, y: 440, w: 12, h: 12, fontSize: 12 },

  // 保証協会 name/address
  guaranteeName: { x: 192, y: 420, w: 400, h: 12, fontSize: 7 },
  guaranteeAddress: { x: 192, y: 406, w: 400, h: 12, fontSize: 7 },

  // 供託所等に関する説明
  localBranchName: { x: 192, y: 382, w: 400, h: 12, fontSize: 7 },
  localBranchAddress: { x: 192, y: 368, w: 400, h: 12, fontSize: 7 },
  depositOffice: { x: 192, y: 344, w: 400, h: 12, fontSize: 7 },
  depositOfficeAddress: { x: 192, y: 330, w: 400, h: 12, fontSize: 7 },

  // Signature section - date
  signatureYear: { x: 420, y: 258, w: 30, h: 12, fontSize: 10 },
  signatureMonth: { x: 462, y: 258, w: 25, h: 12, fontSize: 10 },
  signatureDay: { x: 500, y: 258, w: 25, h: 12, fontSize: 10 },

  // Lender signature block
  lenderSignAddress: { x: 120, y: 228, w: 350, h: 12, fontSize: 9 },
  lenderSignCorpName: { x: 120, y: 210, w: 350, h: 12, fontSize: 9 },
  lenderSignRepName: { x: 120, y: 192, w: 350, h: 12, fontSize: 9 },

  // Borrower signature block
  borrowerSignAddress: { x: 120, y: 158, w: 350, h: 12, fontSize: 9 },
  borrowerSignName: { x: 120, y: 140, w: 350, h: 12, fontSize: 9 },
};

// Page 2: Table of contents - no fillable fields (skip)

// Page 3: Building display, landlord, registry, legal restrictions, infrastructure
export const PAGE3 = {
  // A. 建物の表示
  buildingName: { x: 138, y: 785, w: 430, h: 12, fontSize: 9 },
  addressDisplay: { x: 138, y: 765, w: 430, h: 12, fontSize: 9 },
  addressRegistry: { x: 138, y: 745, w: 430, h: 12, fontSize: 9 },

  // 種類 checkboxes
  typeManshon: { x: 190, y: 726, w: 12, h: 12, fontSize: 10 },
  typeApart: { x: 262, y: 726, w: 12, h: 12, fontSize: 10 },
  typeKodate: { x: 322, y: 726, w: 12, h: 12, fontSize: 10 },
  typeTerrace: { x: 378, y: 726, w: 12, h: 12, fontSize: 10 },

  structure: { x: 138, y: 708, w: 430, h: 12, fontSize: 9 },
  floorArea: { x: 168, y: 690, w: 80, h: 12, fontSize: 9 },
  floorAreaRegistry: { x: 298, y: 690, w: 80, h: 12, fontSize: 9 },
  layout: { x: 435, y: 690, w: 60, h: 12, fontSize: 9 },
  builtDate: { x: 138, y: 672, w: 200, h: 12, fontSize: 9 },

  // B. 貸主の表示
  landlordSameCheck: { x: 200, y: 645, w: 12, h: 12, fontSize: 10 },
  landlordDiffCheck: { x: 348, y: 645, w: 12, h: 12, fontSize: 10 },
  landlordAddress: { x: 100, y: 624, w: 470, h: 12, fontSize: 9 },
  landlordName: { x: 100, y: 606, w: 470, h: 12, fontSize: 9 },
  landlordRemarks: { x: 100, y: 586, w: 470, h: 24, fontSize: 8 },

  // Ⅰ-1. 登記記録
  registryDate: { x: 410, y: 555, w: 160, h: 12, fontSize: 8 },
  ownerAddress: { x: 138, y: 530, w: 430, h: 12, fontSize: 9 },
  ownerName: { x: 138, y: 512, w: 430, h: 12, fontSize: 9 },

  // 甲区 ownership rights checkboxes
  ownershipYes: { x: 222, y: 492, w: 12, h: 12, fontSize: 10 },
  ownershipNo: { x: 260, y: 492, w: 12, h: 12, fontSize: 10 },
  ownershipDetail: { x: 138, y: 474, w: 430, h: 24, fontSize: 8 },

  // 乙区 other rights
  otherRightsYes: { x: 222, y: 440, w: 12, h: 12, fontSize: 10 },
  otherRightsNo: { x: 260, y: 440, w: 12, h: 12, fontSize: 10 },
  otherRightsDetail: { x: 100, y: 418, w: 470, h: 36, fontSize: 7 },

  // Ⅰ-2. 法令制限
  legalRestrictions: { x: 100, y: 350, w: 470, h: 24, fontSize: 8 },

  // Ⅰ-3. インフラ - 飲用水
  waterAvailYes: { x: 225, y: 288, w: 12, h: 12, fontSize: 10 },
  waterAvailNo: { x: 192, y: 288, w: 12, h: 12, fontSize: 10 },
  waterProvider: { x: 280, y: 300, w: 120, h: 12, fontSize: 8 },

  // 電気
  electricAvailYes: { x: 225, y: 248, w: 12, h: 12, fontSize: 10 },
  electricAvailNo: { x: 192, y: 248, w: 12, h: 12, fontSize: 10 },
  electricProvider: { x: 280, y: 260, w: 120, h: 12, fontSize: 8 },
};

// Page 4: Gas, drainage, building inspection, equipment table
export const PAGE4 = {
  // ③ガス
  gasAvailYes: { x: 225, y: 795, w: 12, h: 12, fontSize: 10 },
  gasAvailNo: { x: 192, y: 795, w: 12, h: 12, fontSize: 10 },
  gasType: { x: 280, y: 805, w: 120, h: 12, fontSize: 8 },

  // ④排水
  drainageAvailYes: { x: 225, y: 755, w: 12, h: 12, fontSize: 10 },
  drainageAvailNo: { x: 192, y: 755, w: 12, h: 12, fontSize: 10 },
  drainageType: { x: 280, y: 765, w: 120, h: 12, fontSize: 8 },

  // Ⅰ-6. 設備 - equipment table
  // Each equipment item: checkbox area for 有/無
  // The equipment table starts around y=620 and goes down
  // Row height approximately 18-20px each
  equipmentStartY: 620,
  equipmentRowHeight: 18,
  equipmentYesX: 225,
  equipmentNoX: 268,
  equipmentDetailX: 320,
  equipmentDetailW: 250,
};

// Page 5: Common facilities, hazard zones, hazard map, asbestos, earthquake
export const PAGE5 = {
  // 共用設備 section starts near top
  commonFacilityStartY: 780,
  commonFacilityRowHeight: 22,
  commonYesX: 225,
  commonNoX: 268,
  commonDetailX: 320,
  commonDetailW: 250,

  // 7. 造成宅地防災区域
  hazardZoneOutside: { x: 440, y: 490, w: 12, h: 12, fontSize: 10 },
  hazardZoneInside: { x: 478, y: 490, w: 12, h: 12, fontSize: 10 },

  // 8. 土砂災害
  landslideWarningOutside: { x: 440, y: 452, w: 12, h: 12, fontSize: 10 },
  landslideWarningInside: { x: 478, y: 452, w: 12, h: 12, fontSize: 10 },
  landslideSpecialOutside: { x: 440, y: 434, w: 12, h: 12, fontSize: 10 },
  landslideSpecialInside: { x: 478, y: 434, w: 12, h: 12, fontSize: 10 },

  // 9. 津波
  tsunamiWarningOutside: { x: 440, y: 398, w: 12, h: 12, fontSize: 10 },
  tsunamiWarningInside: { x: 478, y: 398, w: 12, h: 12, fontSize: 10 },
  tsunamiSpecialOutside: { x: 440, y: 380, w: 12, h: 12, fontSize: 10 },
  tsunamiSpecialInside: { x: 478, y: 380, w: 12, h: 12, fontSize: 10 },

  // 10. ハザードマップ
  floodYes: { x: 254, y: 334, w: 12, h: 12, fontSize: 10 },
  floodNo: { x: 280, y: 334, w: 12, h: 12, fontSize: 10 },
  stormWaterYes: { x: 370, y: 334, w: 12, h: 12, fontSize: 10 },
  stormWaterNo: { x: 396, y: 334, w: 12, h: 12, fontSize: 10 },
  stormSurgeYes: { x: 480, y: 334, w: 12, h: 12, fontSize: 10 },
  stormSurgeNo: { x: 506, y: 334, w: 12, h: 12, fontSize: 10 },
  hazardMapDetail: { x: 100, y: 310, w: 470, h: 24, fontSize: 8 },

  // 11. 石綿
  asbestosRecordYes: { x: 102, y: 240, w: 12, h: 12, fontSize: 10 },
  asbestosRecordNo: { x: 102, y: 222, w: 12, h: 12, fontSize: 10 },

  // 12. 耐震
  earthquakeApplicable: { x: 192, y: 168, w: 12, h: 12, fontSize: 10 },
  earthquakeNotApplicable: { x: 310, y: 168, w: 12, h: 12, fontSize: 10 },
  earthquakeDiagYes: { x: 140, y: 148, w: 12, h: 12, fontSize: 10 },
  earthquakeDiagNo: { x: 178, y: 148, w: 12, h: 12, fontSize: 10 },
};

// Page 6: Financial, cancellation, penalty, security measure
export const PAGE6 = {
  // Ⅱ-1. 賃料等
  rent: { x: 252, y: 690, w: 100, h: 12, fontSize: 9 },
  managementFee: { x: 252, y: 670, w: 100, h: 12, fontSize: 9 },
  deposit: { x: 252, y: 650, w: 100, h: 12, fontSize: 9 },
  keyMoney: { x: 252, y: 630, w: 100, h: 12, fontSize: 9 },
  otherFee1Name: { x: 70, y: 610, w: 170, h: 12, fontSize: 8 },
  otherFee1Amount: { x: 252, y: 610, w: 100, h: 12, fontSize: 9 },
  otherFee2Name: { x: 70, y: 592, w: 170, h: 12, fontSize: 8 },
  otherFee2Amount: { x: 252, y: 592, w: 100, h: 12, fontSize: 9 },
  otherFee3Name: { x: 70, y: 574, w: 170, h: 12, fontSize: 8 },
  otherFee3Amount: { x: 252, y: 574, w: 100, h: 12, fontSize: 9 },

  paymentDeadline: { x: 170, y: 548, w: 200, h: 12, fontSize: 8 },
  paymentMethod: { x: 400, y: 548, w: 160, h: 12, fontSize: 8 },
  bankInfo: { x: 70, y: 528, w: 500, h: 12, fontSize: 8 },

  // Ⅱ-3. 違約金
  penaltyNo: { x: 70, y: 172, w: 12, h: 12, fontSize: 10 },
  penaltyYes: { x: 108, y: 172, w: 12, h: 12, fontSize: 10 },
  penaltyDetail: { x: 148, y: 172, w: 420, h: 24, fontSize: 7 },

  // Ⅱ-4. 保全措置
  securityYes: { x: 200, y: 108, w: 12, h: 12, fontSize: 10 },
  securityNo: { x: 300, y: 108, w: 12, h: 12, fontSize: 10 },
};

// Page 7: Contract period, usage restrictions, deposit settlement
export const PAGE7 = {
  // Ⅱ-5. 契約期間
  contractType: { x: 192, y: 805, w: 300, h: 12, fontSize: 9 },
  contractStart: { x: 192, y: 785, w: 200, h: 12, fontSize: 9 },
  contractEnd: { x: 192, y: 765, w: 200, h: 12, fontSize: 9 },
  contractPeriod: { x: 430, y: 765, w: 40, h: 12, fontSize: 9 },

  // 更新料
  renewalFeeYes: { x: 310, y: 720, w: 12, h: 12, fontSize: 10 },
  renewalFeeNo: { x: 348, y: 720, w: 12, h: 12, fontSize: 10 },
  renewalFeeAmount: { x: 370, y: 700, w: 150, h: 12, fontSize: 9 },
  renewalAdminFee: { x: 100, y: 678, w: 300, h: 12, fontSize: 9 },

  // Ⅱ-6. 用途制限
  usagePurpose: { x: 280, y: 640, w: 250, h: 12, fontSize: 8 },
  petPolicy: { x: 280, y: 620, w: 250, h: 12, fontSize: 8 },
  instrumentPolicy: { x: 280, y: 600, w: 250, h: 24, fontSize: 7 },
  renovationPolicy: { x: 280, y: 574, w: 250, h: 24, fontSize: 7 },

  // Ⅱ-7. 敷金精算 - this is mostly pre-printed text
  // The deposit amount field
  depositSettlementAmount: { x: 160, y: 480, w: 120, h: 12, fontSize: 9 },
};

// Page 8: Management, other matters, attachments, remarks
export const PAGE8 = {
  // Ⅱ-8. 管理委託先
  buildingManagerName: { x: 192, y: 740, w: 200, h: 12, fontSize: 8 },
  buildingManagerAddress: { x: 192, y: 722, w: 200, h: 12, fontSize: 7 },
  buildingManagerPhone: { x: 192, y: 704, w: 200, h: 12, fontSize: 8 },

  propertyManagerName: { x: 192, y: 670, w: 200, h: 12, fontSize: 8 },
  propertyManagerAddress: { x: 192, y: 652, w: 200, h: 12, fontSize: 7 },
  propertyManagerPhone: { x: 192, y: 634, w: 200, h: 12, fontSize: 8 },

  // Ⅲ. その他重要事項
  otherMatters: { x: 50, y: 570, w: 510, h: 80, fontSize: 7 },

  // Ⅳ. 添付書類
  attachments: { x: 50, y: 450, w: 510, h: 50, fontSize: 8 },

  // Ⅴ. 備考
  remarks: { x: 50, y: 360, w: 510, h: 80, fontSize: 7 },
};
