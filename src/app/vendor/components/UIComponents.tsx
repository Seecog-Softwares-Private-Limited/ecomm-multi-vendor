import * as React from "react";
import { X, AlertCircle, CheckCircle, Info, AlertTriangle, Loader } from "lucide-react";

// Button Components
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "ghost";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  children: React.ReactNode;
}

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  disabled,
  children,
  className = "",
  ...props
}: ButtonProps) {
  const baseStyles = "font-semibold rounded-xl transition-all inline-flex items-center justify-center gap-2";
  
  const variants = {
    primary: "bg-[#3B82F6] text-white hover:bg-[#2563EB] shadow-md hover:shadow-lg disabled:bg-[#94A3B8] disabled:cursor-not-allowed",
    secondary: "bg-white border-2 border-[#E2E8F0] text-[#1E293B] hover:border-[#3B82F6] hover:text-[#3B82F6] disabled:opacity-50 disabled:cursor-not-allowed",
    danger: "bg-[#DC2626] text-white hover:bg-[#B91C1C] shadow-md hover:shadow-lg disabled:bg-[#94A3B8] disabled:cursor-not-allowed",
    ghost: "text-[#64748B] hover:bg-[#F8FAFC] hover:text-[#1E293B] disabled:opacity-50 disabled:cursor-not-allowed",
  };

  const sizes = {
    sm: "px-3 py-2 text-sm",
    md: "px-6 py-3",
    lg: "px-8 py-4 text-lg",
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Loader className="w-4 h-4 animate-spin" />}
      {children}
    </button>
  );
}

// Input Component
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  icon?: React.ReactNode;
}

export function Input({ label, error, helperText, icon, className = "", ...props }: InputProps) {
  return (
    <div className="space-y-2">
      {label && <label className="block text-sm font-semibold text-[#1E293B]">{label}</label>}
      <div className="relative">
        {icon && <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#64748B]">{icon}</div>}
        <input
          className={`w-full ${icon ? "pl-12" : "pl-4"} pr-4 py-3 border-2 ${
            error ? "border-[#DC2626]" : "border-[#E2E8F0]"
          } rounded-xl focus:border-[#3B82F6] focus:outline-none transition-all bg-white text-[#1E293B] disabled:bg-[#F8FAFC] disabled:cursor-not-allowed ${className}`}
          {...props}
        />
      </div>
      {error && (
        <p className="text-sm text-[#DC2626] flex items-center gap-1">
          <AlertCircle className="w-4 h-4" />
          {error}
        </p>
      )}
      {helperText && !error && <p className="text-sm text-[#64748B]">{helperText}</p>}
    </div>
  );
}

// Textarea Component
interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export function Textarea({ label, error, helperText, className = "", ...props }: TextareaProps) {
  return (
    <div className="space-y-2">
      {label && <label className="block text-sm font-semibold text-[#1E293B]">{label}</label>}
      <textarea
        className={`w-full px-4 py-3 border-2 ${
          error ? "border-[#DC2626]" : "border-[#E2E8F0]"
        } rounded-xl focus:border-[#3B82F6] focus:outline-none transition-all bg-white text-[#1E293B] resize-none ${className}`}
        {...props}
      />
      {error && (
        <p className="text-sm text-[#DC2626] flex items-center gap-1">
          <AlertCircle className="w-4 h-4" />
          {error}
        </p>
      )}
      {helperText && !error && <p className="text-sm text-[#64748B]">{helperText}</p>}
    </div>
  );
}

// Select/Dropdown Component
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  options: { value: string; label: string }[];
}

export function Select({ label, error, helperText, options, className = "", ...props }: SelectProps) {
  return (
    <div className="space-y-2">
      {label && <label className="block text-sm font-semibold text-[#1E293B]">{label}</label>}
      <select
        className={`w-full px-4 py-3 border-2 ${
          error ? "border-[#DC2626]" : "border-[#E2E8F0]"
        } rounded-xl focus:border-[#3B82F6] focus:outline-none transition-all bg-white text-[#1E293B] cursor-pointer ${className}`}
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <p className="text-sm text-[#DC2626] flex items-center gap-1">
          <AlertCircle className="w-4 h-4" />
          {error}
        </p>
      )}
      {helperText && !error && <p className="text-sm text-[#64748B]">{helperText}</p>}
    </div>
  );
}

// Toggle Component
interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
}

export function Toggle({ checked, onChange, label, disabled = false }: ToggleProps) {
  return (
    <label className="flex items-center gap-3 cursor-pointer">
      <div className="relative">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          disabled={disabled}
          className="sr-only"
        />
        <div
          className={`w-12 h-6 rounded-full transition-colors ${
            checked ? "bg-[#3B82F6]" : "bg-[#E2E8F0]"
          } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          <div
            className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
              checked ? "translate-x-6" : ""
            }`}
          />
        </div>
      </div>
      {label && <span className="text-sm font-medium text-[#1E293B]">{label}</span>}
    </label>
  );
}

// Status Badge Component
interface StatusBadgeProps {
  status: "draft" | "submitted" | "approved" | "rejected" | "suspended" | "active" | "inactive" | "pending";
  size?: "sm" | "md" | "lg";
}

export function StatusBadge({ status, size = "md" }: StatusBadgeProps) {
  const statusConfig = {
    draft: { label: "Draft", color: "bg-gray-100 text-gray-700 border-gray-200" },
    submitted: { label: "Submitted", color: "bg-blue-100 text-blue-700 border-blue-200" },
    approved: { label: "Approved", color: "bg-green-100 text-green-700 border-green-200" },
    rejected: { label: "Rejected", color: "bg-red-100 text-red-700 border-red-200" },
    suspended: { label: "Suspended", color: "bg-orange-100 text-orange-700 border-orange-200" },
    active: { label: "Active", color: "bg-green-100 text-green-700 border-green-200" },
    inactive: { label: "Inactive", color: "bg-gray-100 text-gray-700 border-gray-200" },
    pending: { label: "Pending", color: "bg-yellow-100 text-yellow-700 border-yellow-200" },
  };

  const sizes = {
    sm: "text-xs px-2 py-1",
    md: "text-sm px-3 py-1",
    lg: "text-base px-4 py-2",
  };

  const config = statusConfig[status];
  return (
    <span className={`${config.color} ${sizes[size]} font-bold rounded-lg border inline-block`}>
      {config.label}
    </span>
  );
}

// Alert Component
interface AlertProps {
  type: "info" | "success" | "warning" | "error";
  title?: string;
  message: string;
  dismissible?: boolean;
  onDismiss?: () => void;
}

export function Alert({ type, title, message, dismissible = false, onDismiss }: AlertProps) {
  const alertConfig = {
    info: { icon: Info, bgColor: "bg-blue-50", borderColor: "border-blue-200", textColor: "text-blue-800", iconColor: "text-blue-500" },
    success: { icon: CheckCircle, bgColor: "bg-green-50", borderColor: "border-green-200", textColor: "text-green-800", iconColor: "text-green-500" },
    warning: { icon: AlertTriangle, bgColor: "bg-yellow-50", borderColor: "border-yellow-200", textColor: "text-yellow-800", iconColor: "text-yellow-500" },
    error: { icon: AlertCircle, bgColor: "bg-red-50", borderColor: "border-red-200", textColor: "text-red-800", iconColor: "text-red-500" },
  };

  const config = alertConfig[type];
  const Icon = config.icon;

  return (
    <div className={`${config.bgColor} ${config.borderColor} border-2 rounded-xl p-4 flex items-start gap-3`}>
      <Icon className={`w-5 h-5 ${config.iconColor} flex-shrink-0 mt-0.5`} />
      <div className="flex-1">
        {title && <h4 className={`font-bold ${config.textColor} mb-1`}>{title}</h4>}
        <p className={`text-sm ${config.textColor}`}>{message}</p>
      </div>
      {dismissible && onDismiss && (
        <button onClick={onDismiss} className={`${config.iconColor} hover:opacity-70 transition-opacity`}>
          <X className="w-5 h-5" />
        </button>
      )}
    </div>
  );
}

// Modal Component
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
}

export function Modal({ isOpen, onClose, title, children, size = "md" }: ModalProps) {
  if (!isOpen) return null;

  const sizes = {
    sm: "max-w-md",
    md: "max-w-2xl",
    lg: "max-w-4xl",
    xl: "max-w-6xl",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className={`bg-white rounded-2xl shadow-2xl ${sizes[size]} w-full max-h-[90vh] flex flex-col`}>
        <div className="flex items-center justify-between p-6 border-b border-[#E2E8F0]">
          <h2 className="text-2xl font-bold text-[#1E293B]">{title}</h2>
          <button
            onClick={onClose}
            className="text-[#64748B] hover:text-[#1E293B] transition-colors p-2 hover:bg-[#F8FAFC] rounded-lg"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-6">{children}</div>
      </div>
    </div>
  );
}

// Card Component
interface CardProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
  actions?: React.ReactNode;
}

export function Card({ title, children, className = "", actions }: CardProps) {
  return (
    <div className={`bg-white border-2 border-[#E2E8F0] rounded-2xl shadow-sm ${className}`}>
      {title && (
        <div className="flex items-center justify-between p-6 border-b border-[#E2E8F0]">
          <h3 className="text-xl font-bold text-[#1E293B]">{title}</h3>
          {actions && <div>{actions}</div>}
        </div>
      )}
      <div className="p-6">{children}</div>
    </div>
  );
}

// Empty State Component
interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="text-center py-16">
      <div className="w-20 h-20 bg-[#F8FAFC] rounded-full flex items-center justify-center mx-auto mb-6 text-[#64748B]">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-[#1E293B] mb-2">{title}</h3>
      <p className="text-[#64748B] mb-8 max-w-md mx-auto">{description}</p>
      {action && (
        <Button onClick={action.onClick} variant="primary">
          {action.label}
        </Button>
      )}
    </div>
  );
}

// Loading Spinner Component
export function LoadingSpinner({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const sizes = {
    sm: "w-4 h-4",
    md: "w-8 h-8",
    lg: "w-12 h-12",
  };

  return (
    <div className="flex items-center justify-center py-16">
      <Loader className={`${sizes[size]} text-[#3B82F6] animate-spin`} />
    </div>
  );
}

// File Upload Component
interface FileUploadProps {
  label?: string;
  accept?: string;
  onChange: (file: File | null) => void;
  helperText?: string;
  error?: string;
  preview?: string;
  /** When set, shows "Uploaded" with a link to the file (for PDF or any URL). */
  uploadedUrl?: string | null;
  disabled?: boolean;
  /** When true, shows upload progress bar and "Uploading..." state. */
  uploading?: boolean;
}

function isImageUrl(url: string): boolean {
  return /\.(jpe?g|png|gif|webp)(\?|$)/i.test(url) || /\/uploads\/.*\.(jpe?g|png|gif|webp)/i.test(url);
}

export function FileUpload({ label, accept, onChange, helperText, error, preview, uploadedUrl, disabled, uploading }: FileUploadProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    onChange(file);
    if (inputRef.current) inputRef.current.value = "";
  };

  const showUploaded = (uploadedUrl && uploadedUrl.length > 0) || preview;
  const showImagePreview = showUploaded && (preview ? true : isImageUrl(uploadedUrl ?? ""));

  return (
    <div className="space-y-2">
      {label && <label className="block text-sm font-semibold text-[#1E293B]">{label}</label>}
      <div
        onClick={() => !disabled && inputRef.current?.click()}
        className={`border-2 border-dashed ${
          error ? "border-[#DC2626]" : "border-[#E2E8F0]"
        } rounded-xl p-6 text-center transition-colors bg-[#F8FAFC] ${
          disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer hover:border-[#3B82F6]"
        }`}
      >
        <input ref={inputRef} type="file" accept={accept} onChange={handleChange} className="hidden" disabled={disabled} />
        {uploading ? (
          <div className="flex flex-col items-center justify-center gap-3">
            <Loader className="w-10 h-10 text-[#3B82F6] animate-spin" />
            <p className="text-sm font-medium text-[#1E293B]">Uploading…</p>
            <div className="w-full max-w-xs h-2 bg-[#E2E8F0] rounded-full overflow-hidden">
              <div className="h-full w-1/3 bg-[#3B82F6] rounded-full animate-pulse" style={{ animationDuration: "0.8s" }} />
            </div>
          </div>
        ) : showImagePreview ? (
          <div className="flex flex-col items-center justify-center gap-2">
            <img src={preview || uploadedUrl || ""} alt="Preview" className="max-h-32 rounded-lg" />
            <p className="text-sm text-green-600 font-medium">Uploaded. Click to replace.</p>
          </div>
        ) : showUploaded ? (
          <div className="flex flex-col items-center justify-center gap-2">
            <CheckCircle className="w-10 h-10 text-green-600" />
            <p className="text-sm font-medium text-[#1E293B]">Document uploaded</p>
            <a
              href={uploadedUrl || preview || "#"}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-[#3B82F6] hover:underline"
              onClick={(e) => e.stopPropagation()}
            >
              View uploaded file
            </a>
            <p className="text-xs text-[#94A3B8]">Click area to replace</p>
          </div>
        ) : (
          <div>
            <p className="text-[#64748B] mb-2">Click to upload or drag and drop</p>
            <p className="text-sm text-[#94A3B8]">{helperText || "PDF, PNG, JPG (max 5MB)"}</p>
          </div>
        )}
      </div>
      {error && (
        <p className="text-sm text-[#DC2626] flex items-center gap-1">
          <AlertCircle className="w-4 h-4" />
          {error}
        </p>
      )}
    </div>
  );
}
