"use client";

import { motion } from "framer-motion";
import {
  FaLinkedin,
  FaGoogle,
  FaAmazon,
  FaFacebook,
  FaGithub,
} from "react-icons/fa";

export default function TrustedBy() {
  return (
    <section className="bg-gray-50 py-10 border-t border-b border-gray-200">
      <div className="max-w-6xl mx-auto px-6 text-center">
        <p className="text-gray-500 text-sm uppercase tracking-wider mb-6">
          Trusted by professionals from leading companies
        </p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex flex-wrap justify-center items-center gap-10 text-gray-400"
        >
          <FaLinkedin className="w-10 h-10 hover:text-[#0077B5] transition" />
          <FaGoogle className="w-10 h-10 hover:text-[#EA4335] transition" />
          <FaAmazon className="w-10 h-10 hover:text-[#FF9900] transition" />
          <FaFacebook className="w-10 h-10 hover:text-[#1877F2] transition" />
          <FaGithub className="w-10 h-10 hover:text-black transition" />
        </motion.div>

        <p className="mt-8 text-gray-600 text-sm">
          Over{" "}
          <span className="font-semibold text-indigo-600">10,000+</span>{" "}
          professionals use HirePath.ai
        </p>
      </div>
    </section>
  );
}
