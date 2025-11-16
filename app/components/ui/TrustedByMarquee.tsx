"use client";

import {
  FaLinkedin,
  FaGoogle,
  FaAmazon,
  FaFacebook,
  FaGithub,
} from "react-icons/fa";

const LogoRow = () => (
  <div className="flex items-center gap-12 px-4">
    <FaLinkedin className="w-10 h-10 text-gray-400 hover:text-[#0077B5] transition" />
    <FaGoogle className="w-10 h-10 text-gray-400 hover:text-[#EA4335] transition" />
    <FaAmazon className="w-10 h-10 text-gray-400 hover:text-[#FF9900] transition" />
    <FaFacebook className="w-10 h-10 text-gray-400 hover:text-[#1877F2] transition" />
    <FaGithub className="w-10 h-10 text-gray-400 hover:text-black transition" />
  </div>
);

export default function TrustedByMarquee() {
  return (
    <section className="bg-gray-50 py-10 border-t border-b border-gray-200">
      <div className="max-w-6xl mx-auto px-6 text-center">
        <p className="text-gray-500 text-sm uppercase tracking-wider mb-6">
          Trusted by professionals from leading companies
        </p>

        <div className="hp-marquee relative overflow-hidden">
          {/* track width is “natural”; duplicate rows so the -50% loop is seamless */}
          <div
            className="hp-marquee-track flex w-max gap-12 will-change-transform"
            style={{ animation: "hp-scroll 25s linear infinite" }}
          >
            <LogoRow />
            <LogoRow />
            <LogoRow />
            <LogoRow />
          </div>
        </div>

        <p className="mt-8 text-gray-600 text-sm">
          Over{" "}
          <span className="font-semibold text-indigo-600">10,000+</span>{" "}
          professionals use HirePath.ai
        </p>
      </div>
    </section>
  );
}
