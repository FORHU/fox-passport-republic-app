"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { AtSign, Globe } from "lucide-react";

const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-gray-100 pt-20 pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-12 mb-16">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-6 cursor-pointer">
              <div className="flex h-7 w-7 items-center justify-center rounded bg-primary/20 text-primary">
                <Image
                  src="/logofoxpassport.png"
                  alt="Logo"
                  width={20}
                  height={20}
                  className="object-contain"
                />
              </div>
              <span className="text-lg font-extrabold text-gray-900">
                Fox<span className="text-primary">Passport</span>
              </span>
            </Link>
            <p className="text-sm text-gray-500 leading-relaxed max-w-xs">
              Making discovery seamless, exciting, and memorable. Join the
              movement today.
            </p>
          </div>

          {/* Platform */}
          <div>
            <h4 className="text-sm font-extrabold text-gray-900 uppercase tracking-wider mb-6">
              Platform
            </h4>
            <ul className="space-y-4">
              <li>
                <Link
                  href="/?category=Hotels%20%26%20Travel"
                  className="text-sm text-gray-500 hover:text-primary transition-colors"
                >
                  Browse Experiences
                </Link>
              </li>
              <li>
                <Link
                  href="/foxer"
                  className="text-sm text-gray-500 hover:text-primary transition-colors"
                >
                  List Your Space
                </Link>
              </li>
              <li>
                <Link
                  href="/?category=Event%20Planning%20%26%20Services"
                  className="text-sm text-gray-500 hover:text-primary transition-colors"
                >
                  Venues
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-sm font-extrabold text-gray-900 uppercase tracking-wider mb-6">
              Company
            </h4>
            <ul className="space-y-4">
              <li>
                <Link
                  href="/business"
                  className="text-sm text-gray-500 hover:text-primary transition-colors"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  href="/business"
                  className="text-sm text-gray-500 hover:text-primary transition-colors"
                >
                  Careers
                </Link>
              </li>
              <li>
                <Link
                  href="/business"
                  className="text-sm text-gray-500 hover:text-primary transition-colors"
                >
                  Press
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-sm font-extrabold text-gray-900 uppercase tracking-wider mb-6">
              Legal
            </h4>
            <ul className="space-y-4">
              <li>
                <a
                  href="#"
                  className="text-sm text-gray-500 hover:text-primary transition-colors"
                >
                  Privacy Policy
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-sm text-gray-500 hover:text-primary transition-colors"
                >
                  Terms of Service
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-sm text-gray-500 hover:text-primary transition-colors"
                >
                  Cookie Settings
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-gray-50 flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="text-sm text-gray-500">
            &copy; 2024 FoxPassport Inc. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <a
              href="#"
              className="text-gray-500 hover:text-primary transition-colors"
            >
              <AtSign className="w-5 h-5" />
            </a>
            <a
              href="#"
              className="text-gray-500 hover:text-primary transition-colors"
            >
              <Globe className="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
