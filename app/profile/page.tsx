"use client";

import { useState } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { useRouter } from "next/navigation";
import { User, Briefcase, Edit2, MessageSquare, Trophy } from "lucide-react";

type TabType = "about" | "trips" | "progress";

export default function ProfilePage() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>("about");

  // Get user info
  const userName = (user?.name as string) || (user?.username as string) || "User";
  const userInitial = userName.charAt(0).toUpperCase();
  const userEmail = user?.email as string;

  const tabs = [
    { id: "about" as TabType, label: "About me", icon: User },
    { id: "trips" as TabType, label: "Past trips", icon: Briefcase },
    { id: "progress" as TabType, label: "Progress", icon: Trophy },
  ];

  const handleTabClick = (tabId: TabType) => {
    if (tabId === "progress") {
      router.push("/progress");
    } else {
      setActiveTab(tabId);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-16">
          
          {/* Left Sidebar - Profile Navigation */}
          <aside className="lg:w-64 flex-shrink-0">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Profile</h1>
            
            <nav className="space-y-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                
                return (
                  <button
                    key={tab.id}
                    onClick={() => handleTabClick(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all duration-200 ${
                      isActive
                        ? "bg-gray-100 font-semibold text-gray-900"
                        : "text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      isActive ? "bg-gray-800" : "bg-gray-200"
                    }`}>
                      <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-gray-600"}`} />
                    </div>
                    <span className="text-sm">{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </aside>

          {/* Right Content Area */}
          <main className="flex-1 min-w-0">
            {activeTab === "about" && (
              <div className="space-y-8">
                {/* Header with Edit button */}
                <div className="flex items-center gap-3">
                  <h2 className="text-2xl font-bold text-gray-900">About me</h2>
                  <button className="px-3 py-1 text-xs font-medium text-gray-600 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors">
                    Edit
                  </button>
                </div>

                {/* Profile Card */}
                <div className="flex flex-col sm:flex-row gap-6 sm:gap-8">
                  {/* Avatar Card */}
                  <div className="flex-shrink-0">
                    <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm text-center w-48">
                      <div className="w-24 h-24 mx-auto rounded-full bg-gray-900 flex items-center justify-center mb-4">
                        <span className="text-3xl font-bold text-white">{userInitial}</span>
                      </div>
                      <h3 className="text-xl font-bold text-gray-900">{userName}</h3>
                      <p className="text-sm text-gray-500 mt-1">Guest</p>
                    </div>
                  </div>

                  {/* Complete Profile Prompt */}
                  <div className="flex-1">
                    <div className="bg-white border border-gray-200 rounded-2xl p-6">
                      <div className="flex items-start gap-4">
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-gray-900 mb-2">
                            Complete your profile
                          </h3>
                          <p className="text-sm text-gray-600 leading-relaxed mb-4">
                            Your FoxPassport profile is an important part of every reservation. 
                            Complete yours to help other hosts and guests get to know you.
                          </p>
                          <button className="px-6 py-2.5 bg-[#E31C79] text-white text-sm font-semibold rounded-lg hover:bg-pink-700 transition-colors shadow-sm">
                            Get started
                          </button>
                        </div>
                        <Edit2 className="w-8 h-8 text-gray-300 flex-shrink-0 hidden sm:block" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Reviews Section */}
                <div className="pt-4">
                  <div className="flex items-center gap-3 text-gray-600">
                    <MessageSquare className="w-5 h-5" />
                    <span className="text-sm font-medium">Reviews I&apos;ve written</span>
                  </div>
                  
                  <div className="mt-4 py-8 text-center text-gray-400">
                    <p className="text-sm">No reviews yet</p>
                  </div>
                </div>

                {/* User Info Section */}
                {userEmail && (
                  <div className="border-t border-gray-100 pt-6">
                    <h3 className="text-sm font-semibold text-gray-900 mb-3">Account info</h3>
                    <div className="space-y-2">
                      <p className="text-sm text-gray-600">
                        <span className="text-gray-500">Email:</span> {userEmail}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === "trips" && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900">Past trips</h2>
                
                <div className="bg-gray-50 rounded-2xl p-8 text-center">
                  <Briefcase className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">No trips yet</h3>
                  <p className="text-sm text-gray-500 mb-4">
                    When you book your first trip, it will appear here.
                  </p>
                  <button 
                    onClick={() => window.location.href = "/"}
                    className="px-6 py-2.5 bg-[#E31C79] text-white text-sm font-semibold rounded-lg hover:bg-pink-700 transition-colors shadow-sm"
                  >
                    Start exploring
                  </button>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}