"use client";

import { HelpCircle, Send, Phone, Mail, MessageSquare } from "lucide-react";
import { Button, Input, Textarea, Card, Alert } from "../components/UIComponents";
import * as React from "react";

export function VendorSupport() {
  const [subject, setSubject] = React.useState("");
  const [message, setMessage] = React.useState("");
  const [category, setCategory] = React.useState("general");

  const handleSubmit = () => {
    if (!subject || !message) {
      alert("Please fill in all fields");
      return;
    }
    alert("Support ticket submitted successfully! We'll get back to you within 24 hours.");
    setSubject("");
    setMessage("");
  };

  const contactMethods = [
    {
      icon: Phone,
      title: "Phone Support",
      description: "Call us for urgent issues",
      value: "+91 1800-123-4567",
      color: "from-blue-500 to-indigo-600",
    },
    {
      icon: Mail,
      title: "Email Support",
      description: "Send us a detailed email",
      value: "vendor-support@indovypar.com",
      color: "from-green-500 to-emerald-600",
    },
    {
      icon: MessageSquare,
      title: "Live Chat",
      description: "Chat with our team",
      value: "Available 9 AM - 6 PM IST",
      color: "from-purple-500 to-pink-600",
    },
  ];

  const faqs = [
    {
      question: "How do I add a new product?",
      answer:
        'Go to Products → Add Product. Fill in all details and submit for approval. Products must be approved by admin before going live.',
    },
    {
      question: "When will I receive my payout?",
      answer:
        "Payouts are processed weekly (every Friday) for orders delivered in the previous week. Funds are transferred within 2-3 business days.",
    },
    {
      question: "How do I update my bank account?",
      answer:
        "Visit Profile & KYC → Bank Details. Update your information and submit. Bank changes require admin approval.",
    },
    {
      question: "What is the commission structure?",
      answer:
        "Commission varies by category, typically 10-15%. You can see the exact commission for each order in the Earnings section.",
    },
    {
      question: "How do I handle returns?",
      answer:
        "You cannot process returns directly. If there's an issue, use the 'Report an Issue' button on the order detail page. Admin will handle the return/refund.",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-[#1E293B] mb-2">Support & Help</h1>
        <p className="text-[#64748B]">Get help with your vendor account</p>
      </div>

      {/* Contact Methods */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {contactMethods.map((method, index) => {
          const Icon = method.icon;
          return (
            <Card key={index}>
              <div className="text-center">
                <div
                  className={`w-16 h-16 bg-gradient-to-br ${method.color} rounded-full flex items-center justify-center mx-auto mb-4`}
                >
                  <Icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-bold text-[#1E293B] mb-2">{method.title}</h3>
                <p className="text-sm text-[#64748B] mb-3">{method.description}</p>
                <p className="font-semibold text-[#3B82F6]">{method.value}</p>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Submit Ticket */}
      <Card title="Submit a Support Ticket">
        <div className="space-y-6">
          <Alert
            type="info"
            message="Our support team typically responds within 24 hours on business days. For urgent issues, please call us."
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Subject"
              placeholder="Brief description of your issue"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              required
            />
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-[#1E293B]">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-3 border-2 border-[#E2E8F0] rounded-xl focus:border-[#3B82F6] focus:outline-none transition-all bg-white text-[#1E293B]"
              >
                <option value="general">General Inquiry</option>
                <option value="orders">Orders & Fulfillment</option>
                <option value="products">Product Listings</option>
                <option value="payments">Payments & Payouts</option>
                <option value="technical">Technical Issue</option>
                <option value="account">Account & KYC</option>
              </select>
            </div>
          </div>

          <Textarea
            label="Message"
            placeholder="Describe your issue in detail..."
            rows={6}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
          />

          <div className="flex justify-end">
            <Button variant="primary" onClick={handleSubmit}>
              <Send className="w-5 h-5" />
              Submit Ticket
            </Button>
          </div>
        </div>
      </Card>

      {/* FAQs */}
      <Card title="Frequently Asked Questions">
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="bg-[#F8FAFC] rounded-xl p-6 border-2 border-[#E2E8F0] hover:border-[#3B82F6] transition-colors"
            >
              <div className="flex items-start gap-3">
                <HelpCircle className="w-5 h-5 text-[#3B82F6] flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-semibold text-[#1E293B] mb-2">{faq.question}</h4>
                  <p className="text-sm text-[#64748B]">{faq.answer}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Help Resources */}
      <Card title="Additional Resources">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <a
            href="#"
            className="flex items-center gap-3 p-4 bg-[#F8FAFC] rounded-xl hover:bg-[#F1F5F9] transition-colors border-2 border-transparent hover:border-[#3B82F6]"
          >
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <HelpCircle className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="font-semibold text-[#1E293B]">Vendor Guidelines</p>
              <p className="text-sm text-[#64748B]">Read our complete vendor manual</p>
            </div>
          </a>
          <a
            href="#"
            className="flex items-center gap-3 p-4 bg-[#F8FAFC] rounded-xl hover:bg-[#F1F5F9] transition-colors border-2 border-transparent hover:border-[#3B82F6]"
          >
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="font-semibold text-[#1E293B]">Video Tutorials</p>
              <p className="text-sm text-[#64748B]">Watch step-by-step guides</p>
            </div>
          </a>
        </div>
      </Card>
    </div>
  );
}
