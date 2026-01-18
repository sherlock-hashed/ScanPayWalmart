
export interface BundleItem {
  productId: string;
  quantity: number;
}

export interface Bundle {
  id: string;
  name: string;
  description: string;
  items: BundleItem[];
  bundlePrice?: number;
  discountPercentage?: number;
  discountAmount?: number;
  isActive: boolean;
  priority: number;
  createdAt: string;
  updatedAt: string;
}

export interface DetectedBundleOffer {
  bundleId: string;
  bundleName: string;
  potentialSaving: number;
  isAccepted: boolean;
  missingItems?: BundleItem[];
  isComplete: boolean;
}

export interface AppliedBundle {
  bundleId: string;
  bundleName: string;
  bundlePrice?: number;
  discountPercentage?: number;
  discountAmount?: number;
  savedAmount: number;
}
