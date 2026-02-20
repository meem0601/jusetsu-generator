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
  // Header - borrower/lender names (confirmed Y≈740 via grid ruler)
  borrowerName: { x: 124, y: 740, w: 180, h: 12, fontSize: 10 },
  lenderName: { x: 351, y: 740, w: 210, h: 12, fontSize: 10 },

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
// Coordinates derived from template image (1190x1684 at 2x) → PDF: x/2, 842-y/2
export const PAGE3 = {
  // A. 建物の表示 (confirmed via grid ruler)
  buildingName: { x: 175, y: 772, w: 400, h: 14, fontSize: 9 },
  addressDisplay: { x: 175, y: 750, w: 400, h: 14, fontSize: 9 },
  addressRegistry: { x: 175, y: 728, w: 400, h: 14, fontSize: 9 },

  // 種類 checkboxes (Y=706)
  typeManshon: { x: 175, y: 706, w: 12, h: 12, fontSize: 10 },
  typeApart: { x: 240, y: 706, w: 12, h: 12, fontSize: 10 },
  typeKodate: { x: 300, y: 706, w: 12, h: 12, fontSize: 10 },
  typeTerrace: { x: 360, y: 706, w: 12, h: 12, fontSize: 10 },

  structure: { x: 175, y: 684, w: 400, h: 14, fontSize: 9 },
  floorArea: { x: 175, y: 662, w: 80, h: 14, fontSize: 9 },
  floorAreaRegistry: { x: 300, y: 662, w: 80, h: 14, fontSize: 9 },
  layout: { x: 450, y: 662, w: 60, h: 14, fontSize: 9 },
  builtDate: { x: 175, y: 640, w: 200, h: 14, fontSize: 9 },

  // B. 貸主の表示 (Y≈600 for checkboxes, 578/556 for values)
  landlordSameCheck: { x: 175, y: 600, w: 12, h: 12, fontSize: 10 },
  landlordDiffCheck: { x: 330, y: 600, w: 12, h: 12, fontSize: 10 },
  landlordAddress: { x: 175, y: 578, w: 400, h: 14, fontSize: 9 },
  landlordName: { x: 175, y: 556, w: 400, h: 14, fontSize: 9 },
  landlordRemarks: { x: 175, y: 534, w: 400, h: 20, fontSize: 8 },

  // Ⅰ-1. 登記記録 (Y≈492/470)
  registryDate: { x: 400, y: 510, w: 160, h: 12, fontSize: 8 },
  ownerAddress: { x: 225, y: 492, w: 350, h: 14, fontSize: 9 },
  ownerName: { x: 225, y: 470, w: 350, h: 14, fontSize: 9 },

  // 甲区 ownership rights checkboxes (Y≈438)
  ownershipYes: { x: 175, y: 438, w: 12, h: 12, fontSize: 10 },
  ownershipNo: { x: 210, y: 438, w: 12, h: 12, fontSize: 10 },
  ownershipDetail: { x: 240, y: 420, w: 330, h: 20, fontSize: 8 },

  // 乙区 other rights (Y≈395)
  otherRightsYes: { x: 175, y: 395, w: 12, h: 12, fontSize: 10 },
  otherRightsNo: { x: 210, y: 395, w: 12, h: 12, fontSize: 10 },
  otherRightsDetail: { x: 240, y: 378, w: 330, h: 40, fontSize: 7 },

  // Ⅰ-2. 法令制限 (Y≈272)
  legalRestrictions: { x: 56, y: 272, w: 510, h: 30, fontSize: 8 },

  // Ⅰ-3. インフラ - 飲用水 (Y≈148)
  waterAvailNo: { x: 175, y: 148, w: 12, h: 12, fontSize: 10 },
  waterAvailYes: { x: 210, y: 148, w: 12, h: 12, fontSize: 10 },
  waterProvider: { x: 280, y: 148, w: 120, h: 12, fontSize: 8 },

  // 電気 (Y≈88)
  electricAvailNo: { x: 175, y: 88, w: 12, h: 12, fontSize: 10 },
  electricAvailYes: { x: 210, y: 88, w: 12, h: 12, fontSize: 10 },
  electricProvider: { x: 280, y: 88, w: 120, h: 12, fontSize: 8 },
};

// Page 4: Gas, drainage, building inspection, equipment table
// Y values confirmed via grid ruler
export const PAGE4 = {
  // ③ガス (Y≈790)
  gasAvailNo: { x: 175, y: 790, w: 12, h: 12, fontSize: 10 },
  gasAvailYes: { x: 210, y: 790, w: 12, h: 12, fontSize: 10 },
  gasType: { x: 120, y: 790, w: 50, h: 12, fontSize: 8 },

  // ④排水 (Y≈680)
  drainageAvailNo: { x: 175, y: 680, w: 12, h: 12, fontSize: 10 },
  drainageAvailYes: { x: 210, y: 680, w: 12, h: 12, fontSize: 10 },
  drainageType: { x: 120, y: 680, w: 50, h: 12, fontSize: 8 },

  // Ⅰ-6. 設備 - equipment table (first row at Y≈430, row height ~30)
  equipmentStartY: 430,
  equipmentRowHeight: 26,
  equipmentYesX: 175,
  equipmentNoX: 210,
  equipmentDetailX: 400,
  equipmentDetailW: 160,
};

// Page 5: Common facilities, hazard zones, hazard map, asbestos, earthquake
// Image 2x coords converted: PDF_x = img_x/2, PDF_y = 842 - img_y/2
export const PAGE5 = {
  // 共用設備: first row img y=274, row height 32px → PDF startY=842-137=705, rowH=16
  commonFacilityStartY: 705,
  commonFacilityRowHeight: 16,
  commonYesX: 116,     // img 232/2
  commonNoX: 145,      // img 290/2
  commonDetailX: 550,  // img 1100/2 (備考)
  commonDetailW: 45,

  // 7. 造成宅地防災区域 (img: 外x=548,内x=612, y=660)
  hazardZoneOutside: { x: 274, y: 512, w: 12, h: 12, fontSize: 10 },
  hazardZoneInside: { x: 306, y: 512, w: 12, h: 12, fontSize: 10 },

  // 8. 土砂災害 (img y=730, 758)
  landslideWarningOutside: { x: 274, y: 477, w: 12, h: 12, fontSize: 10 },
  landslideWarningInside: { x: 306, y: 477, w: 12, h: 12, fontSize: 10 },
  landslideSpecialOutside: { x: 274, y: 463, w: 12, h: 12, fontSize: 10 },
  landslideSpecialInside: { x: 306, y: 463, w: 12, h: 12, fontSize: 10 },

  // 9. 津波 (img y=826, 854)
  tsunamiWarningOutside: { x: 274, y: 429, w: 12, h: 12, fontSize: 10 },
  tsunamiWarningInside: { x: 306, y: 429, w: 12, h: 12, fontSize: 10 },
  tsunamiSpecialOutside: { x: 274, y: 415, w: 12, h: 12, fontSize: 10 },
  tsunamiSpecialInside: { x: 306, y: 415, w: 12, h: 12, fontSize: 10 },

  // 10. ハザードマップ (img y=922)
  floodYes: { x: 195, y: 381, w: 12, h: 12, fontSize: 10 },
  floodNo: { x: 219, y: 381, w: 12, h: 12, fontSize: 10 },
  stormWaterYes: { x: 300, y: 381, w: 12, h: 12, fontSize: 10 },
  stormWaterNo: { x: 324, y: 381, w: 12, h: 12, fontSize: 10 },
  stormSurgeYes: { x: 395, y: 381, w: 12, h: 12, fontSize: 10 },
  stormSurgeNo: { x: 419, y: 381, w: 12, h: 12, fontSize: 10 },
  hazardMapDetail: { x: 31, y: 360, w: 533, h: 24, fontSize: 8 },

  // 11. 石綿 (img: 有y=1062, 無y=1094 → PDF: 311, 295)
  asbestosRecordYes: { x: 74, y: 311, w: 12, h: 12, fontSize: 10 },
  asbestosRecordNo: { x: 74, y: 295, w: 12, h: 12, fontSize: 10 },

  // 12. 耐震 (img: 該当するx=262,y=1272 → PDF: 131,206; 該当しないx=332 → 166)
  earthquakeApplicable: { x: 131, y: 206, w: 12, h: 12, fontSize: 10 },
  earthquakeNotApplicable: { x: 166, y: 206, w: 12, h: 12, fontSize: 10 },
  earthquakeDiagYes: { x: 84, y: 191, w: 12, h: 12, fontSize: 10 },
  earthquakeDiagNo: { x: 109, y: 191, w: 12, h: 12, fontSize: 10 },
};

// Page 6: Financial, cancellation, penalty, security measure
// Y values confirmed via grid ruler
export const PAGE6 = {
  // Ⅱ-1. 賃料等 (rent=668, mgmt=643, deposit=618, keyMoney=593, other=568)
  rent: { x: 350, y: 668, w: 120, h: 14, fontSize: 9 },
  managementFee: { x: 350, y: 643, w: 120, h: 14, fontSize: 9 },
  deposit: { x: 350, y: 618, w: 120, h: 14, fontSize: 9 },
  keyMoney: { x: 350, y: 593, w: 120, h: 14, fontSize: 9 },
  otherFee1Name: { x: 56, y: 568, w: 290, h: 14, fontSize: 8 },
  otherFee1Amount: { x: 350, y: 568, w: 120, h: 14, fontSize: 9 },
  otherFee2Name: { x: 56, y: 543, w: 290, h: 14, fontSize: 8 },
  otherFee2Amount: { x: 350, y: 543, w: 120, h: 14, fontSize: 9 },
  otherFee3Name: { x: 56, y: 518, w: 290, h: 14, fontSize: 8 },
  otherFee3Amount: { x: 350, y: 518, w: 120, h: 14, fontSize: 9 },

  paymentDeadline: { x: 56, y: 500, w: 200, h: 14, fontSize: 8 },
  paymentMethod: { x: 300, y: 500, w: 150, h: 14, fontSize: 8 },
  bankInfo: { x: 56, y: 472, w: 510, h: 28, fontSize: 7, maxWidth: 510 },

  // Ⅱ-3. 違約金 (Y≈130)
  penaltyNo: { x: 100, y: 130, w: 12, h: 12, fontSize: 10 },
  penaltyYes: { x: 140, y: 130, w: 12, h: 12, fontSize: 10 },
  penaltyDetail: { x: 170, y: 130, w: 400, h: 24, fontSize: 7 },

  // Ⅱ-4. 保全措置 (Y≈72)
  securityYes: { x: 200, y: 72, w: 12, h: 12, fontSize: 10 },
  securityNo: { x: 280, y: 72, w: 12, h: 12, fontSize: 10 },
};

// Page 7: Contract period, usage restrictions, deposit settlement
// Y values confirmed via grid ruler
export const PAGE7 = {
  // Ⅱ-5. 契約期間
  contractType: { x: 200, y: 750, w: 300, h: 14, fontSize: 9 },
  contractStart: { x: 200, y: 730, w: 200, h: 14, fontSize: 9 },
  contractEnd: { x: 200, y: 718, w: 200, h: 14, fontSize: 9 },
  contractPeriod: { x: 430, y: 718, w: 50, h: 14, fontSize: 9 },

  // 更新料 (Y≈660)
  renewalFeeYes: { x: 300, y: 660, w: 12, h: 12, fontSize: 10 },
  renewalFeeNo: { x: 340, y: 660, w: 12, h: 12, fontSize: 10 },
  renewalFeeAmount: { x: 200, y: 640, w: 300, h: 30, fontSize: 8 },
  renewalAdminFee: { x: 56, y: 610, w: 300, h: 14, fontSize: 9 },

  // Ⅱ-6. 用途制限
  usagePurpose: { x: 200, y: 555, w: 350, h: 14, fontSize: 8 },
  petPolicy: { x: 200, y: 530, w: 350, h: 14, fontSize: 8 },
  instrumentPolicy: { x: 200, y: 505, w: 350, h: 24, fontSize: 7 },
  renovationPolicy: { x: 200, y: 478, w: 350, h: 30, fontSize: 7 },

  // Ⅱ-7. 敷金精算
  depositSettlementAmount: { x: 200, y: 400, w: 150, h: 14, fontSize: 9 },
};

// Page 8: Management, other matters, attachments, remarks
// Y values confirmed via grid ruler
export const PAGE8 = {
  // Ⅱ-8. 管理委託先 - 建物管理 (name=722, address=700)
  buildingManagerName: { x: 175, y: 722, w: 200, h: 14, fontSize: 8 },
  buildingManagerAddress: { x: 175, y: 700, w: 200, h: 14, fontSize: 7 },
  buildingManagerPhone: { x: 420, y: 722, w: 150, h: 14, fontSize: 8 },

  // 家賃管理 (name=642, address=622)
  propertyManagerName: { x: 175, y: 642, w: 200, h: 14, fontSize: 8 },
  propertyManagerAddress: { x: 175, y: 622, w: 200, h: 14, fontSize: 7 },
  propertyManagerPhone: { x: 420, y: 642, w: 150, h: 14, fontSize: 8 },

  // Ⅲ. その他重要事項 (Y≈455)
  otherMatters: { x: 56, y: 455, w: 510, h: 40, fontSize: 7 },

  // Ⅳ. 添付書類 (Y≈428)
  attachments: { x: 56, y: 428, w: 510, h: 30, fontSize: 8 },

  // Ⅴ. 備考 (Y≈390)
  remarks: { x: 56, y: 390, w: 510, h: 40, fontSize: 7 },
};
