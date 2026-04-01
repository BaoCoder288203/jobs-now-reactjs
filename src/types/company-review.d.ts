export interface CompanyReview {
  reviewId: number;
  userName: string;
  rating: number;
  title: string;
  pros?: string;
  cons?: string;
  recommend: boolean;
  createdAt: string;
}

export interface CompanyReviewListResponse {
  items: CompanyReview[];
  totalCount: number;
  averageRating: number;
  page: number;
  limit: number;
  hasNext: boolean;
}

export interface CreateCompanyReviewRequest {
  rating: number;
  title: string;
  pros?: string;
  cons?: string;
  recommend: boolean;
}
