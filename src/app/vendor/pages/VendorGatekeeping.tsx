import { Link } from "../../components/Link";
import { AlertCircle, CheckCircle, Clock, XCircle, Ban, FileText, Edit, HelpCircle } from "lucide-react";
import { Button, Alert } from "../components/UIComponents";

interface VendorGatekeepingProps {
  status?: "draft" | "submitted" | "approved" | "rejected" | "suspended" | "on_hold";
  statusReason?: string;
  rejectionReason?: string;
  suspensionReason?: string;
}

export function VendorGatekeeping({ status: statusProp, statusReason, rejectionReason, suspensionReason }: VendorGatekeepingProps) {
  const reason = statusReason ?? rejectionReason ?? suspensionReason;
  const status = statusProp ?? "draft";
  const getContent = () => {
    switch (status) {
      case "draft":
        return {
          icon: <FileText className="w-16 h-16 text-[#64748B]" />,
          bgColor: "from-gray-50 to-gray-100",
          title: "Complete Your Vendor Profile",
          description:
            "Your vendor profile is incomplete. Please fill in all required information and submit for approval to start selling on Indovypar Marketplace.",
          alert: null,
          actions: (
            <div className="flex items-center justify-center gap-4">
              <Link href="/vendor/profile">
                <Button variant="primary" size="lg">
                  <Edit className="w-5 h-5" />
                  Complete Profile
                </Button>
              </Link>
            </div>
          ),
        };

      case "submitted":
        return {
          icon: <Clock className="w-16 h-16 text-[#3B82F6]" />,
          bgColor: "from-blue-50 to-indigo-100",
          title: "Profile Under Review",
          description:
            "Your vendor profile has been submitted successfully. Our team is reviewing your information. This usually takes 24-48 hours. We'll notify you once approved.",
          alert: (
            <Alert
              type="info"
              title="Review in Progress"
              message="Your profile is being verified by our admin team. You'll receive an email notification once the review is complete."
            />
          ),
          actions: (
            <div className="flex items-center justify-center gap-4">
              <Link href="/vendor/profile">
                <Button variant="secondary">
                  <FileText className="w-5 h-5" />
                  View Submission
                </Button>
              </Link>
              <Link href="/vendor/support">
                <Button variant="ghost">
                  <HelpCircle className="w-5 h-5" />
                  Contact Support
                </Button>
              </Link>
            </div>
          ),
        };

      case "rejected":
        return {
          icon: <XCircle className="w-16 h-16 text-[#DC2626]" />,
          bgColor: "from-red-50 to-orange-100",
          title: "Profile Rejected",
          description:
            "Your vendor profile has been rejected. Please review the reason below, make necessary changes, and resubmit for approval.",
          alert: (
            <Alert
              type="error"
              title="Rejection Reason"
              message={
                reason ||
                "Your profile was rejected due to incomplete or incorrect information. Please update and resubmit."
              }
            />
          ),
          actions: (
            <div className="flex items-center justify-center gap-4">
              <Link href="/vendor/profile">
                <Button variant="danger" size="lg">
                  <Edit className="w-5 h-5" />
                  Edit & Resubmit
                </Button>
              </Link>
              <Link href="/vendor/support">
                <Button variant="secondary">
                  <HelpCircle className="w-5 h-5" />
                  Contact Support
                </Button>
              </Link>
            </div>
          ),
        };

      case "on_hold":
        return {
          icon: <Clock className="w-16 h-16 text-[#F59E0B]" />,
          bgColor: "from-amber-50 to-orange-100",
          title: "Account On Hold",
          description:
            "Your vendor account is currently on hold. Please review the reason below and contact support if you have questions.",
          alert: reason ? (
            <Alert type="warning" title="Reason" message={reason} />
          ) : null,
          actions: (
            <div className="flex items-center justify-center gap-4">
              <Link href="/vendor/support">
                <Button variant="primary" size="lg">
                  <HelpCircle className="w-5 h-5" />
                  Contact Support
                </Button>
              </Link>
              <Link href="/vendor/profile">
                <Button variant="secondary">
                  <FileText className="w-5 h-5" />
                  View Profile
                </Button>
              </Link>
            </div>
          ),
        };

      case "suspended":
        return {
          icon: <Ban className="w-16 h-16 text-[#F59E0B]" />,
          bgColor: "from-orange-50 to-yellow-100",
          title: "Account Suspended",
          description:
            "Your vendor account has been temporarily suspended. This means you cannot access orders or products until the issue is resolved. Please contact support immediately.",
          alert: (
            <Alert
              type="warning"
              title="Suspension Reason"
              message={
                reason ||
                "Your account has been suspended due to policy violations or pending verification. Contact support for more details."
              }
            />
          ),
          actions: (
            <div className="flex items-center justify-center gap-4">
              <Link href="/vendor/support">
                <Button variant="primary" size="lg">
                  <HelpCircle className="w-5 h-5" />
                  Contact Support
                </Button>
              </Link>
              <Link href="/vendor/profile">
                <Button variant="secondary">
                  <FileText className="w-5 h-5" />
                  View Profile
                </Button>
              </Link>
            </div>
          ),
        };

      default:
        return null;
    }
  };

  const content = getContent();
  if (!content) return null;

  return (
    <div className={`min-h-[calc(100vh-8rem)] flex items-center justify-center bg-gradient-to-br ${content.bgColor} p-8`}>
      <div className="max-w-3xl w-full">
        <div className="bg-white rounded-2xl shadow-2xl border-2 border-[#E2E8F0] p-12">
          {/* Icon */}
          <div className="flex justify-center mb-6">{content.icon}</div>

          {/* Title */}
          <h1 className="text-4xl font-bold text-[#1E293B] text-center mb-4">{content.title}</h1>

          {/* Description */}
          <p className="text-lg text-[#64748B] text-center mb-8">{content.description}</p>

          {/* Alert */}
          {content.alert && <div className="mb-8">{content.alert}</div>}

          {/* Actions */}
          {content.actions}

          {/* Additional Info */}
          <div className="mt-12 pt-8 border-t border-[#E2E8F0]">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div>
                <h4 className="font-semibold text-[#1E293B] mb-2">Quick Response</h4>
                <p className="text-sm text-[#64748B]">We typically review profiles within 24-48 hours</p>
              </div>
              <div>
                <h4 className="font-semibold text-[#1E293B] mb-2">Need Help?</h4>
                <p className="text-sm text-[#64748B]">Our support team is here to assist you</p>
              </div>
              <div>
                <h4 className="font-semibold text-[#1E293B] mb-2">Secure Platform</h4>
                <p className="text-sm text-[#64748B]">Your data is safe and encrypted</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
