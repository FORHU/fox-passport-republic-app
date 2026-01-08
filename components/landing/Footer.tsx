"use client";

import React from "react";
import Link from "next/link";

const Footer: React.FC = () => {
  return (
    <footer className="bg-black pt-20 pb-10 border-t border-white/10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-16">
          <div className="md:col-span-5">
            <div className="flex items-center gap-3 mb-8 group">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white text-black transition-transform group-hover:rotate-12">
                <span className="material-symbols-outlined text-[24px]">explore</span>
              </div>
              <span className="text-2xl font-display font-bold text-white group-hover:text-accent transition-colors">
                Foxxing
              </span>
            </div>
            <p className="text-gray-400 leading-relaxed mb-8 max-w-sm text-lg">
              The ultimate platform for the next generation of explorers. We make discovering and booking experiences in the Philippines seamless and exciting.
            </p>
            <div className="flex gap-4">
              <a className="h-12 w-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-accent hover:text-black hover:border-accent hover:shadow-[0_0_20px_rgba(204,255,0,0.4)] transition-all duration-300 transform hover:-translate-y-1" href="#">
                <span className="sr-only">Twitter</span>
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84"></path>
                </svg>
              </a>
              <a className="h-12 w-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-secondary hover:text-white hover:border-secondary hover:shadow-[0_0_20px_rgba(219,39,119,0.4)] transition-all duration-300 transform hover:-translate-y-1" href="#">
                <span className="sr-only">Instagram</span>
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path clipRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 015.468 2.52c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" fillRule="evenodd"></path>
                </svg>
              </a>
            </div>
          </div>
          <div className="md:col-span-2">
            <h3 className="font-bold text-white mb-6 font-display">Discover</h3>
            <ul className="space-y-4">
              <li>
                <a className="text-sm text-gray-400 hover:text-accent font-medium transition-colors hover:pl-2 inline-block" href="#">
                  Events
                </a>
              </li>
              <li>
                <a className="text-sm text-gray-400 hover:text-accent font-medium transition-colors hover:pl-2 inline-block" href="#">
                  Adventures
                </a>
              </li>
              <li>
                <a className="text-sm text-gray-400 hover:text-accent font-medium transition-colors hover:pl-2 inline-block" href="#">
                  Venues
                </a>
              </li>
            </ul>
          </div>
          <div className="md:col-span-2">
            <h3 className="font-bold text-white mb-6 font-display">Company</h3>
            <ul className="space-y-4">
              <li>
                <a className="text-sm text-gray-400 hover:text-accent font-medium transition-colors hover:pl-2 inline-block" href="#">
                  About
                </a>
              </li>
              <li>
                <a className="text-sm text-gray-400 hover:text-accent font-medium transition-colors hover:pl-2 inline-block" href="#">
                  Careers
                </a>
              </li>
              <li>
                <a className="text-sm text-gray-400 hover:text-accent font-medium transition-colors hover:pl-2 inline-block" href="#">
                  Blog
                </a>
              </li>
            </ul>
          </div>
          <div className="md:col-span-3">
            <h3 className="font-bold text-white mb-6 font-display">Download App</h3>
            <p className="text-xs text-gray-400 mb-4">Get the full experience on mobile.</p>
            <div className="flex gap-2">
              <button className="bg-white/10 border border-white/20 text-white px-4 py-3 rounded-xl text-xs font-bold flex items-center gap-2 hover:bg-white hover:text-black transition-all hover:scale-105 hover:shadow-lg">
                <span className="material-symbols-outlined text-[18px]">ios</span>
                App Store
              </button>
              <button className="bg-white/10 border border-white/20 text-white px-4 py-3 rounded-xl text-xs font-bold flex items-center gap-2 hover:bg-white hover:text-black transition-all hover:scale-105 hover:shadow-lg">
                <span className="material-symbols-outlined text-[18px]">android</span>
                Google Play
              </button>
            </div>
          </div>
        </div>
        <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-gray-500 font-medium">© 2024 Foxxing Inc. All rights reserved.</p>
          <div className="flex gap-6">
            <a className="text-xs text-gray-500 hover:text-white font-medium transition-colors" href="#">
              Privacy
            </a>
            <a className="text-xs text-gray-500 hover:text-white font-medium transition-colors" href="#">
              Terms
            </a>
            <a className="text-xs text-gray-500 hover:text-white font-medium transition-colors" href="#">
              Cookies
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
