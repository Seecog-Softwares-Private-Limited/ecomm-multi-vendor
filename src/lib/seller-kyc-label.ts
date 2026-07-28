/** KYC badge label derived from seller account status (matches /admin/sellers list). */
export function kycLabelFromSellerStatus(
  status: string
): "Pending" | "Approved" | "Rejected" | "Blocked" {
  switch (status) {
    case "APPROVED":
      return "Approved";
    case "REJECTED":
      return "Rejected";
    case "SUSPENDED":
      return "Blocked";
    default:
      return "Pending";
  }
}
