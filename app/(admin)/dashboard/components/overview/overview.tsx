"use client";

// ============================================
// IMPORTS SECTION - সকল প্রয়োজনীয় imports
// ============================================
import React, { useState, useMemo } from "react";
import {
  ArrowUp,
  ArrowDown,
  Package,
  Clock,
  CheckCircle,
  XCircle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/app/lib/utils";

// ============================================
// TYPE DEFINITIONS - ডেটা টাইপ সংজ্ঞা
// ============================================

// মেট্রিক কার্ডের জন্য interface
interface MetricCardProps {
  title: string;
  value: string;
  change: string;
  changeType: "increase" | "decrease";
  lastMonth: string;
  icon: React.ElementType;
}

// রিকুয়েস্ট ডেটার জন্য interface
interface RecentRequest {
  id: string;
  customer: string;
  package: string;
  date: string;
  status: "pending" | "completed" | "rejected";
  amount: string;
}

// ============================================
// METRIC CARD COMPONENT - মেট্রিক কার্ড কম্পোনেন্ট
// ============================================
const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  change,
  changeType,
  lastMonth,
  icon: Icon,
}) => {
  // বৃদ্ধি হয়েছে কিনা চেক করা
  const isIncrease = changeType === "increase";
  const ChangeIcon = isIncrease ? ArrowUp : ArrowDown;

  return (

    <>
        <div className="flex-1 min-w-[200px] bg-white hover:shadow-lg transition-all duration-300 border border-gray-200 hover:border-[#76C043]/30 rounded-lg">
        
      {/* কার্ডের হেডার সেকশন */}
      <div className="p-5 pb-2">
        <div className="flex items-center justify-between">
          {/* কার্ডের টাইটেল */}
          <h3 className="text-sm font-medium text-gray-600 uppercase tracking-wide">
            {title}
          </h3>
          {/* কার্ডের আইকন - বিভিন্ন স্ট্যাটাসের জন্য বিভিন্ন রঙ */}
          <div
            className={cn(
              "w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-sm",
              title === "Total Request" && "bg-blue-500",
              title === "Completed" && "bg-green-500",
              title === "Pending" && "bg-yellow-500",
              title === "Rejected" && "bg-red-500"
            )}
          >
            <Icon className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* কার্ডের মূল ডেটা সেকশন */}
      <div className="p-6 pt-0">
        {/* মেইন ভ্যালু */}
        <div className="text-3xl font-bold mb-2 text-gray-900">{value}</div>
        
        {/* পরিবর্তনের তথ্য */}
        <div className="flex items-center text-sm">
          {/* বৃদ্ধি/হ্রাসের আইকন */}
          <ChangeIcon
            className={cn(
              "w-4 h-4 mr-1",
              isIncrease ? "text-green-600" : "text-red-600"
            )}
          />
          {/* পরিবর্তনের পার্সেন্টেজ */}
          <span
            className={cn(
              "font-medium",
              isIncrease ? "text-green-600" : "text-red-600"
            )}
          >
            {change}
          </span>
          {/* গত মাসের তুলনা */}
          <span className="text-gray-500 ml-2">vs {lastMonth} last month</span>
        </div>
      </div>
    </div>
    </>


  );
};

// ============================================
// PAGINATION COMPONENT - পেজিনেশন কম্পোনেন্ট
// ============================================
interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
}) => {
  return (
    <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
      {/* পেজের তথ্য */}
      <div className="text-sm text-gray-700">
        Showing page {currentPage} of {totalPages}
      </div>
      
      {/* পেজিনেশন বাটন */}
      <div className="flex items-center space-x-2">
        {/* পূর্ববর্তী পেজ বাটন */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={cn(
            "flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
            currentPage === 1
              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
              : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
          )}
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          Previous
        </button>

        {/* পেজ নাম্বারস */}
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={cn(
              "px-3 py-2 text-sm font-medium rounded-md transition-colors",
              currentPage === page
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
            )}
          >
            {page}
          </button>
        ))}

        {/* পরবর্তী পেজ বাটন */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={cn(
            "flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
            currentPage === totalPages
              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
              : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
          )}
        >
          Next
          <ChevronRight className="w-4 h-4 ml-1" />
        </button>
      </div>
    </div>
  );
};

// ============================================
// RECENT REQUESTS TABLE - সাম্প্রতিক রিকুয়েস্ট টেবিল
// ============================================
const RecentRequestsTable: React.FC = () => {
  // পেজিনেশনের জন্য state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20; // প্রতি পেজে ২০টি আইটেম

  // ডামি ডেটা - সাধারণত API থেকে আসবে (useMemo দিয়ে optimize করা হয়েছে)
  const allRequests: RecentRequest[] = useMemo(() => [
    // প্রথম ২০টি রিকুয়েস্ট
    {
      id: "REQ-001",
      customer: "John Smith",
      package: "Premier League",
      date: "2024-01-15",
      status: "completed",
      amount: "$2,499",
    },
    {
      id: "REQ-002",
      customer: "Emily Johnson",
      package: "Champions League",
      date: "2024-01-14",
      status: "pending",
      amount: "$3,299",
    },
    {
      id: "REQ-003",
      customer: "Michael Brown",
      package: "World Cup",
      date: "2024-01-13",
      status: "completed",
      amount: "$4,999",
    },
    {
      id: "REQ-004",
      customer: "Sarah Davis",
      package: "NBA Finals",
      date: "2024-01-12",
      status: "rejected",
      amount: "$1,899",
    },
    {
      id: "REQ-005",
      customer: "David Wilson",
      package: "Super Bowl",
      date: "2024-01-11",
      status: "pending",
      amount: "$5,599",
    },
    // আরো ডেটা যোগ করা হয়েছে পেজিনেশন টেস্টের জন্য
    {
      id: "REQ-006",
      customer: "Lisa Anderson",
      package: "Euro Championship",
      date: "2024-01-10",
      status: "completed",
      amount: "$3,799",
    },
    {
      id: "REQ-007",
      customer: "Mark Thompson",
      package: "Copa America",
      date: "2024-01-09",
      status: "pending",
      amount: "$2,999",
    },
    {
      id: "REQ-008",
      customer: "Jennifer Lee",
      package: "Olympics",
      date: "2024-01-08",
      status: "completed",
      amount: "$6,999",
    },
    {
      id: "REQ-009",
      customer: "Robert Garcia",
      package: "Tennis Grand Slam",
      date: "2024-01-07",
      status: "rejected",
      amount: "$4,299",
    },
    {
      id: "REQ-010",
      customer: "Amanda White",
      package: "Formula 1",
      date: "2024-01-06",
      status: "pending",
      amount: "$5,199",
    },
    // ১১-২০ নাম্বার রিকুয়েস্ট
    {
      id: "REQ-011",
      customer: "Brian Jones",
      package: "Cricket World Cup",
      date: "2024-01-05",
      status: "completed",
      amount: "$3,499",
    },
    {
      id: "REQ-012",
      customer: "Nicole Taylor",
      package: "Golf Masters",
      date: "2024-01-04",
      status: "pending",
      amount: "$2,799",
    },
    {
      id: "REQ-013",
      customer: "Kevin Martinez",
      package: "Boxing Championship",
      date: "2024-01-03",
      status: "completed",
      amount: "$4,599",
    },
    {
      id: "REQ-014",
      customer: "Rachel Clark",
      package: "Swimming Championship",
      date: "2024-01-02",
      status: "rejected",
      amount: "$1,999",
    },
    {
      id: "REQ-015",
      customer: "Steven Rodriguez",
      package: "Basketball Finals",
      date: "2024-01-01",
      status: "pending",
      amount: "$3,899",
    },
    {
      id: "REQ-016",
      customer: "Michelle Lewis",
      package: "Baseball World Series",
      date: "2023-12-31",
      status: "completed",
      amount: "$2,599",
    },
    {
      id: "REQ-017",
      customer: "Daniel Walker",
      package: "Hockey Finals",
      date: "2023-12-30",
      status: "pending",
      amount: "$3,199",
    },
    {
      id: "REQ-018",
      customer: "Laura Hall",
      package: "Rugby Championship",
      date: "2023-12-29",
      status: "completed",
      amount: "$4,199",
    },
    {
      id: "REQ-019",
      customer: "Christopher Allen",
      package: "Volleyball Finals",
      date: "2023-12-28",
      status: "rejected",
      amount: "$1,799",
    },
    {
      id: "REQ-020",
      customer: "Samantha Young",
      package: "Badminton Championship",
      date: "2023-12-27",
      status: "pending",
      amount: "$2,299",
    },
    // ২১-৪০ নাম্বার রিকুয়েস্ট (দ্বিতীয় পেজের জন্য)
    {
      id: "REQ-021",
      customer: "Andrew King",
      package: "Table Tennis Championship",
      date: "2023-12-26",
      status: "completed",
      amount: "$1,899",
    },
    {
      id: "REQ-022",
      customer: "Stephanie Wright",
      package: "Cycling Tour",
      date: "2023-12-25",
      status: "pending",
      amount: "$3,599",
    },
    {
      id: "REQ-023",
      customer: "Joshua Lopez",
      package: "Marathon Championship",
      date: "2023-12-24",
      status: "completed",
      amount: "$2,399",
    },
    {
      id: "REQ-024",
      customer: "Ashley Hill",
      package: "Skiing Championship",
      date: "2023-12-23",
      status: "rejected",
      amount: "$4,799",
    },
    {
      id: "REQ-025",
      customer: "Ryan Scott",
      package: "Surfing Competition",
      date: "2023-12-22",
      status: "pending",
      amount: "$3,299",
    },
  ], []); // empty dependency array কারণ এটি static data

  // পেজিনেশনের জন্য ডেটা গণনা
  const totalPages = Math.ceil(allRequests.length / itemsPerPage);
  
  // বর্তমান পেজের ডেটা ফিল্টার করা
  const currentData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return allRequests.slice(startIndex, endIndex);
  }, [currentPage, allRequests]);

  // স্ট্যাটাস অনুযায়ী আইকন রিটার্ন করা
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case "pending":
        return <Clock className="w-4 h-4 text-yellow-600" />;
      case "rejected":
        return <XCircle className="w-4 h-4 text-red-600" />;
      default:
        return null;
    }
  };

  // স্ট্যাটাস অনুযায়ী ব্যাজ স্টাইল রিটার্ন করা
  const getStatusBadge = (status: string) => {
    const baseClasses =
      "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium";
    switch (status) {
      case "completed":
        return `${baseClasses} bg-green-100 text-green-800`;
      case "pending":
        return `${baseClasses} bg-yellow-100 text-yellow-800`;
      case "rejected":
        return `${baseClasses} bg-red-100 text-red-800`;
      default:
        return baseClasses;
    }
  };

  // পেজ পরিবর্তন হ্যান্ডলার
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className="mt-8 bg-white border border-gray-200 rounded-lg shadow-sm">
      {/* টেবিলের হেডার */}
      <div className="pb-0">
        <h2 className="text-lg font-semibold text-gray-900 m-6">
          Recent Requests
        </h2>
      </div>

      {/* টেবিল সেকশন */}
      <div className="p-6 pt-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            {/* টেবিলের হেডার */}
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-600">
                  Request ID
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">
                  Customer
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">
                  Package
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">
                  Date
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">
                  Status
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">
                  Amount
                </th>
              </tr>
            </thead>

            {/* টেবিলের বডি - বর্তমান পেজের ডেটা */}
            <tbody>
              {currentData.map((request) => (
                <tr
                  key={request.id}
                  className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                >
                  {/* রিকুয়েস্ট আইডি */}
                  <td className="py-3 px-4 text-sm font-medium text-gray-900">
                    {request.id}
                  </td>
                  {/* কাস্টমার নাম */}
                  <td className="py-3 px-4 text-sm text-gray-700">
                    {request.customer}
                  </td>
                  {/* প্যাকেজ নাম */}
                  <td className="py-3 px-4 text-sm text-gray-700">
                    {request.package}
                  </td>
                  {/* তারিখ */}
                  <td className="py-3 px-4 text-sm text-gray-500">
                    {request.date}
                  </td>
                  {/* স্ট্যাটাস ব্যাজ */}
                  <td className="py-3 px-4">
                    <span className={getStatusBadge(request.status)}>
                      {getStatusIcon(request.status)}
                      <span className="ml-1 capitalize">
                        {request.status}
                      </span>
                    </span>
                  </td>
                  {/* পরিমাণ */}
                  <td className="py-3 px-4 text-sm font-medium text-gray-900">
                    {request.amount}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* পেজিনেশন কম্পোনেন্ট */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />
    </div>
  );
};

// ============================================
// MAIN SALES OVERVIEW COMPONENT - মূল কম্পোনেন্ট
// ============================================
export function SalesOverview() {
  // মেট্রিক্স ডেটা - ড্যাশবোর্ডের উপরের কার্ডগুলির জন্য
  const metrics: MetricCardProps[] = [
    {
      title: "Total Request",
      value: "1,250",
      change: "3.5%",
      changeType: "increase" as const,
      lastMonth: "1,200",
      icon: Package,
    },
    {
      title: "Completed",
      value: "980",
      change: "5.2%",
      changeType: "increase" as const,
      lastMonth: "930",
      icon: CheckCircle,
    },
    {
      title: "Pending",
      value: "180",
      change: "2.1%",
      changeType: "decrease" as const,
      lastMonth: "190",
      icon: Clock,
    },
    {
      title: "Rejected",
      value: "90",
      change: "1.5%",
      changeType: "increase" as const,
      lastMonth: "85",
      icon: XCircle,
    },
  ];

  return (
    <div>
      {/* মেট্রিক কার্ড গ্রিড - উপরের সেকশন */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {metrics.map((metric) => (
          <MetricCard key={metric.title} {...metric} />
        ))}
      </div>

      {/* সাম্প্রতিক রিকুয়েস্ট টেবিল - নিচের সেকশন */}
      <RecentRequestsTable />
    </div>
  );
}
