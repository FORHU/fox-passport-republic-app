"use client";

import React from "react";
import Link from "next/link";
import { Building2, TrendingUp, Users, Award, Check } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";

export default function BusinessPage() {
  const { openLogin } = useAuthStore();

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-pink-600 via-pink-500 to-rose-500 text-white overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-10" />
        <div className="relative max-w-7xl mx-auto px-4 py-20 md:py-32">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              Grow your business with <span className="text-white drop-shadow-lg">FoxPassport</span>
            </h1>
            <p className="text-xl md:text-2xl mb-10 text-pink-50 leading-relaxed">
              Connect with millions of travelers looking for their next adventure. 
              Build your reputation and increase bookings.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={openLogin}
                className="px-8 py-4 bg-white text-pink-600 font-bold rounded-lg hover:bg-pink-50 transition-all shadow-xl hover:shadow-2xl hover:scale-105 text-lg"
              >
                Get Started Free
              </button>
              <Link
                href="#features"
                className="px-8 py-4 bg-transparent border-2 border-white text-white font-bold rounded-lg hover:bg-white/10 transition-all text-lg"
              >
                Learn More
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4">
              Why businesses choose FoxPassport
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Everything you need to showcase your venue and attract more guests
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: TrendingUp,
                title: "Increase Visibility",
                description: "Get discovered by travelers actively searching for experiences in your area",
                color: "text-blue-500",
                bgColor: "bg-blue-50",
              },
              {
                icon: Users,
                title: "Build Trust",
                description: "Collect authentic reviews and showcase your best features to potential guests",
                color: "text-green-500",
                bgColor: "bg-green-50",
              },
              {
                icon: Building2,
                title: "Manage Your Listing",
                description: "Easy-to-use dashboard to update photos, pricing, and availability in real-time",
                color: "text-purple-500",
                bgColor: "bg-purple-50",
              },
              {
                icon: Award,
                title: "Stand Out",
                description: "Get certified as a FoxPassport verified venue and earn special badges",
                color: "text-pink-500",
                bgColor: "bg-pink-50",
              },
            ].map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <div
                  key={idx}
                  className="bg-white rounded-2xl p-8 border-2 border-gray-100 hover:border-pink-500 hover:shadow-xl transition-all duration-300 group"
                >
                  <div className={`${feature.bgColor} w-16 h-16 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                    <Icon className={`w-8 h-8 ${feature.color}`} />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4">
              Simple, transparent pricing
            </h2>
            <p className="text-xl text-gray-600">
              Choose the plan that works best for your business
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                name: "Starter",
                price: "Free",
                description: "Perfect for getting started",
                features: [
                  "Basic listing",
                  "Up to 5 photos",
                  "Customer reviews",
                  "Basic analytics",
                ],
                cta: "Start Free",
                highlighted: false,
              },
              {
                name: "Professional",
                price: "₱499",
                period: "/month",
                description: "For growing businesses",
                features: [
                  "Featured listing",
                  "Unlimited photos",
                  "Priority support",
                  "Advanced analytics",
                  "FoxPassport verified badge",
                  "Social media integration",
                ],
                cta: "Get Started",
                highlighted: true,
              },
              {
                name: "Enterprise",
                price: "Custom",
                description: "For large operations",
                features: [
                  "Multiple locations",
                  "Dedicated account manager",
                  "Custom integrations",
                  "API access",
                  "White-label options",
                ],
                cta: "Contact Sales",
                highlighted: false,
              },
            ].map((plan, idx) => (
              <div
                key={idx}
                className={`rounded-2xl p-8 border-2 ${
                  plan.highlighted
                    ? "border-pink-500 bg-gradient-to-br from-pink-50 to-white shadow-2xl scale-105"
                    : "border-gray-200 bg-white"
                } transition-all hover:shadow-xl`}
              >
                {plan.highlighted && (
                  <div className="text-center mb-4">
                    <span className="inline-block px-4 py-1 bg-pink-500 text-white text-sm font-bold rounded-full">
                      Most Popular
                    </span>
                  </div>
                )}
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  {plan.name}
                </h3>
                <div className="mb-4">
                  <span className="text-4xl font-bold text-gray-900">
                    {plan.price}
                  </span>
                  {plan.period && (
                    <span className="text-gray-600">{plan.period}</span>
                  )}
                </div>
                <p className="text-gray-600 mb-6">{plan.description}</p>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, fIdx) => (
                    <li key={fIdx} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
                <button
                  onClick={openLogin}
                  className={`w-full py-3 rounded-lg font-bold transition-all ${
                    plan.highlighted
                      ? "bg-pink-600 text-white hover:bg-pink-700 shadow-md"
                      : "bg-gray-100 text-gray-900 hover:bg-gray-200"
                  }`}
                >
                  {plan.cta}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-gray-900 to-gray-800 text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            Ready to grow your business?
          </h2>
          <p className="text-xl text-gray-300 mb-10">
            Join thousands of businesses already thriving on FoxPassport
          </p>
          <button
            onClick={openLogin}
            className="px-12 py-4 bg-pink-600 text-white font-bold rounded-lg hover:bg-pink-700 transition-all shadow-xl hover:shadow-2xl hover:scale-105 text-lg"
          >
            Create Your Free Account
          </button>
        </div>
      </section>
    </div>
  );
}
