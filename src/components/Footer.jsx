import React from "react";
import { FaTwitter, FaLinkedin, FaGithub, FaInstagram, FaHeart } from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="bg-blue-700 text-white py-6 border-t border-blue-400 mt-auto">
      <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center">
        {/* 🌍 Left Section - Copyright */}
        <p className="text-sm md:text-base">&copy; 2024 NextGen Learning. All Rights Reserved.</p>

        {/* 🔗 Middle Section - Social Media Links */}
        <div className="flex space-x-5 my-3 md:my-0">
          {/* <SocialLink href="#" icon={<FaTwitter />} />
          <SocialLink href="#" icon={<FaLinkedin />} />
          <SocialLink href="#" icon={<FaGithub />} />
          <SocialLink href="#" icon={<FaInstagram />} /> */}
        </div>

        {/* 💙 Right Section - Credits */}
        <p className="text-sm md:text-base">
          Built by{" "}
          <a
            href="https://teamignite.in"
            className="text-blue-200 hover:text-white transition duration-300"
          >
            Team Ignite
          </a>{" "}
          with <FaHeart className="inline text-red-500 text-lg" />
        </p>
      </div>
    </footer>
  );
};

// 🔗 Social Media Icon Component
const SocialLink = ({ href, icon }) => (
  <a
    href={href}
    className="text-white text-xl hover:text-blue-300 transition duration-300"
    target="_blank"
    rel="noopener noreferrer"
  >
    {icon}
  </a>
);

export default Footer;
