import React, { useState } from "react";
import {
  Home,
  Send,
  CreditCard,
  Briefcase,
  DollarSign,
  Users,
  Settings,
  ChevronDown,
  ChevronRight,
} from "lucide-react";

const Sidebar = () => {
  const [activeTab, setActiveTab] = useState("Payments");
  const [openSection, setOpenSection] = useState(null);

  const toggleSection = (label) => {
    setOpenSection(openSection === label ? null : label);
  };

  const tabs = [
    {
      icon: <Home size={20} />,
      label: "Home",
      sections: [
        {
          title: "Overview",
          items: [
            "Dashboard Overview",
            "Recent Updates",
            "API Status",
            "Release Notes",
          ],
        },
        {
          title: "Resources",
          items: ["Developer Docs", "Support", "Community"],
        },
      ],
    },
    {
      icon: <Send size={20} />,
      label: "Get Started",
      sections: [
        {
          title: "Integration Guides",
          items: [
            "API Keys Setup",
            "Checkout Integration",
            "Plugin Setup",
            "Test Mode",
          ],
        },
        {
          title: "SDKs & Libraries",
          items: ["React SDK", "Node SDK", "Android SDK", "iOS SDK"],
        },
      ],
    },
    {
      icon: <CreditCard size={20} />,
      label: "Payments",
      sections: [
        {
          title: "Razorpay Payments",
          items: [
            "Payments Changelog",
            "Sign Up",
            "Dashboard",
            "Customers",
            "Orders",
            "Payments",
            "International Payments",
            "Payment Methods",
            "Settlements",
            "Refunds",
            "Disputes",
            "Payment Gateway",
            "Ecommerce Plugins",
            "Widgets",
            "Magic Checkout",
            "Razorpay - Payments on WhatsApp",
            "Payment Links",
          ],
        },
        {
          title: "Banking Plus",
          items: ["Overview", "Accounts", "Payouts", "Reconciliation"],
        },
        {
          title: "Partners",
          items: ["Partner APIs", "Payout Links", "Partner Onboarding"],
        },
      ],
    },
    {
      icon: <Briefcase size={20} />,
      label: "POS",
      sections: [
        {
          title: "Razorpay POS",
          items: [
            "Overview",
            "Smart Collect",
            "Device Management",
            "Transactions",
            "POS Reports",
          ],
        },
      ],
    },
    {
      icon: <DollarSign size={20} />,
      label: "Payroll",
      sections: [
        {
          title: "Payroll Management",
          items: [
            "Overview",
            "Employees",
            "Salary Slips",
            "Tax & Compliance",
            "Reports",
          ],
        },
      ],
    },
    {
      icon: <Users size={20} />,
      label: "Partners",
      sections: [
        {
          title: "Partner Network",
          items: [
            "Partner Dashboard",
            "Commission Reports",
            "API Integrations",
            "Referral Links",
          ],
        },
      ],
    },
    {
      icon: <Settings size={20} />,
      label: "Tools",
      sections: [
        {
          title: "Utilities",
          items: [
            "QR Code Generator",
            "Webhook Tester",
            "API Playground",
            "Sandbox Mode",
          ],
        },
        {
          title: "Account Settings",
          items: ["Profile", "Security", "Team Management", "Billing"],
        },
      ],
    },
  ];

  // Find current active tab
  const activeTabData = tabs.find((t) => t.label === activeTab);

  return (
    <div className="flex h-screen bg-gray-500 text-white font-sans">
      {/* Left Tab Bar */}
      <div className="w-16 bg-[#0B1220] flex flex-col items-center py-6 space-y-6">
        {tabs.map((tab, index) => (
          <button
            key={index}
            onClick={() => {
              setActiveTab(tab.label);
              setOpenSection(null); // reset opened section when switching tabs
            }}
            className={`flex flex-col items-center transition-all ${
              activeTab === tab.label
                ? "text-blue-400"
                : "text-gray-300 hover:text-blue-400"
            }`}
          >
            {tab.icon}
            <span className="text-[10px] mt-1 block">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Right Panel */}
      <div className="w-64 bg-[#162340] overflow-y-auto pt-5">
        {/* Search Box */}
        <div className="p-3">
          <input
            type="text"
            placeholder="Search"
            className="w-full text-sm bg-gray-500 text-gray-100 px-3 py-2 rounded outline-none focus:ring-1 focus:ring-gray-200"
          />
        </div>

        {/* Sections only for active tab */}
        <div className="space-y-2">
          {activeTabData.sections.map((section, idx) => (
            <div key={idx}>
              <div
                className={`flex justify-between items-center px-4 py-2 cursor-pointer text-gray-300 font-semibold text-sm hover:bg-[#1E2A4A] ${
                  openSection === section.title
                    ? "bg-[#1E2A4A] text-white"
                    : ""
                }`}
                onClick={() => toggleSection(section.title)}
              >
                <span>{section.title}</span>
                {openSection === section.title ? (
                  <ChevronDown size={16} />
                ) : (
                  <ChevronRight size={16} />
                )}
              </div>

              {/* Sub-items */}
              {openSection === section.title && (
                <div className="pl-6 pr-2 py-1 space-y-1 text-gray-400 text-sm">
                  {section.items.map((item, i) => (
                    <div
                      key={i}
                      className="cursor-pointer hover:text-white hover:bg-[#1E2A4A] px-2 py-1 rounded-md flex items-center gap-2"
                    >
                      <span className="text-xs">{">>"}</span> {item}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
