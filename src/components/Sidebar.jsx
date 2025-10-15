import React, { useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  Home,
  Monitor,
  Building2,
  GitBranch,
} from "lucide-react";
import { useNavigation } from "../contexts/NavigationContext";
import { useNavigate, useLocation } from "react-router-dom";

const Sidebar = ({ showRightPanel = false }) => {
  const [openSections, setOpenSections] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const { activeTab, setActiveTab } = useNavigation();
  const navigate = useNavigate();
  const location = useLocation();

  const toggleSection = (label) => {
    setOpenSections(prev => 
      prev.includes(label) 
        ? prev.filter(section => section !== label)
        : [...prev, label]
    );
  };

  const handleItemClick = (item) => {
    setSelectedItem(item);
  };

  // Left navigation tabs
  const tabs = [
    {
      icon: <Monitor size={20} />,
      label: "Platform",
    },
    {
      icon: <Building2 size={20} />,
      label: "Organization",
    },
    {
      icon: <GitBranch size={20} />,
      label: "Branch",
    },
  ];

  // Static sections data
  const sections = [
    {
      title: "Overview",
      items: [
        "Dashboard Overview",
        "Recent Updates",
        "API Status",
        "Release Notes",
        "System Health",
        "Performance Metrics",
        "User Analytics",
        "Error Logs",
      ],
    },
    {
      title: "Resources",
      items: [
        "Developer Docs", 
        "Support", 
        "Community",
        "Tutorials",
        "Video Guides",
        "FAQ",
        "Best Practices",
        "Code Examples",
      ],
    },
    {
      title: "Integration Guides",
      items: [
        "API Keys Setup",
        "Checkout Integration",
        "Webhook Configuration",
        "Testing Environment",
        "Production Setup",
        "Security Guidelines",
        "Rate Limiting",
        "Error Handling",
      ],
    },
    {
      title: "SDKs & Libraries",
      items: [
        "JavaScript SDK", 
        "Python SDK", 
        "PHP SDK", 
        "Mobile SDKs",
        "React Components",
        "Vue.js Integration",
        "Angular Support",
        "Node.js Library",
      ],
    },
    {
      title: "Payment Methods",
      items: [
        "Credit Cards",
        "Digital Wallets",
        "Bank Transfers",
        "Cryptocurrency",
        "UPI Payments",
        "Net Banking",
        "EMI Options",
        "International Cards",
      ],
    },
    {
      title: "Payment Processing",
      items: [
        "Transaction Flow",
        "Refund Process",
        "Chargeback Handling",
        "Fraud Prevention",
        "Settlement Process",
        "Reconciliation",
        "Dispute Management",
        "Compliance",
      ],
    },
    {
      title: "Analytics & Reporting",
      items: [
        "Transaction Reports",
        "Revenue Analytics",
        "Customer Insights",
        "Performance Dashboards",
        "Custom Reports",
        "Data Export",
        "Real-time Monitoring",
        "Alert Configuration",
      ],
    },
    {
      title: "Account Management",
      items: [
        "Profile Settings",
        "Team Management",
        "Role Permissions",
        "API Access",
        "Billing Information",
        "Subscription Plans",
        "Usage Limits",
        "Security Settings",
      ],
    },
  ];

  // Determine if we should show the right panel
  const shouldShowRightPanel = location.pathname !== "/";

  return (
    <div className={`flex h-screen text-white font-sans transition-colors duration-200 ${
      shouldShowRightPanel ? 'w-full' : 'w-[100px]'
    }`}>
      {/* Left Tab Bar - Always visible */}
      <div className="w-[100px] bg-white border-r border-gray-200 dark:bg-gray-800 flex flex-col items-center py-6 space-y-6 pt-8 transition-colors duration-200">
        {/* Home Button */}
        <button
          onClick={() => {
            setActiveTab("Home");
            navigate("/");
          }}
          className={`flex flex-col items-center transition-all ${
            location.pathname === "/"
              ? "text-[#DE5E08]"
              : "text-black dark:text-white hover:text-[#DE5E08]"
          }`}
        >
          <Home size={20} />
          <span className="text-[10px] mt-1 block">Home</span>
        </button>
        
        {tabs.map((tab, index) => {
          const routePath = tab.label.toLowerCase();
          return (
            <button
              key={index}
              onClick={() => {
                setActiveTab(tab.label);
                navigate(`/${routePath}`);
              }}
              className={`flex flex-col items-center transition-all ${
                location.pathname === `/${routePath}`
                  ? "text-[#DE5E08]"
                  : "text-black dark:text-white hover:text-[#DE5E08]"
              }`}
            >
              {tab.icon}
              <span className="text-[10px] mt-1 block">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Right Content Panel - Only show if not on Home page */}
      {shouldShowRightPanel && (
        <div className="flex-1 h-full bg-white dark:bg-gray-800 flex flex-col transition-colors duration-200">
          {/* Fixed Search Box */}
          <div className="p-3 pt-6 flex-shrink-0 pb-6">
            <input
              type="text"
              placeholder="Search"
              className="w-full text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-white text-black dark:text-white px-3 py-2 rounded outline-none focus:ring-1 focus:ring-gray-200 dark:focus:ring-gray-500 transition-colors duration-200"
            />
          </div>

          {/* Scrollable Sections */}
          <div className="flex-1 overflow-y-auto custom-scrollbar pb-6">
            <div className="space-y-2 pb-4">
              {sections.map((section, idx) => (
                <div key={idx}>
                  <div
                    className={`flex justify-between items-center px-4 py-2 cursor-pointer text-gray-900 dark:text-white font-semibold text-sm hover:border-l-2  hover:border-[#DE5E08] ${
                      openSections.includes(section.title)
                        ? "bg-gray-100 border-l-2 border-[#DE5E08] dark:bg-gray-700 text-gray-900 dark:text-white"
                        : ""
                    }`}
                    onClick={() => toggleSection(section.title)}
                  >
                    <span>{section.title}</span>
                    <div className={`transition-transform duration-500 ease-in-out ${
                      openSections.includes(section.title) ? 'rotate-90' : 'rotate-0'
                    }`}>
                      <ChevronRight size={16} />
                    </div>
                  </div>

                  {/* Sub-items */}
                  <div 
                    className={`overflow-hidden transition-all duration-500 ease-in-out ${
                      openSections.includes(section.title)
                        ? 'max-h-96 opacity-100' 
                        : 'max-h-0 opacity-0'
                    }`}
                  >
                    <div className="pl-6 pr-2 py-1 space-y-1 text-gray-900 dark:text-white text-sm">
                      {section.items.map((item, i) => (
                        <div
                          key={i}
                          onClick={() => handleItemClick(item)}
                          className={`cursor-pointer px-2 py-1 rounded-md flex items-center gap-2 transition-colors duration-200 ${
                            selectedItem === item
                              ? 'bg-gray-100 text-gray-900 dark:bg-[#DE5E08] dark:text-white'
                              : 'dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700'
                          }`}
                        >
                          {item}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sidebar;