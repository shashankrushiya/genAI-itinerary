import React from 'react';
import { motion } from 'framer-motion';
import { Mail, Heart, Github, Linkedin } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-black text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Brand */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="md:col-span-2"
          >
            <h3 className="text-2xl font-semibold text-white mb-4 tracking-tight">GenItinerary</h3>
            <p className="text-white/70 mb-6 max-w-md">
              Plan smarter, not harder. GenItinerary helps you sketch a trip in minutes,
              refine days with smart suggestions, and export or share with one click.
              A clean, fast, dark UI keeps the focus on your adventure.
            </p>
            <div className="flex items-center space-x-2 text-gray-400">
              <Heart size={16} className="text-red-500" />
              <span>Made with passion for travelers</span>
            </div>
          </motion.div>

          {/* Quick Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            <h4 className="text-lg font-semibold mb-4 text-white">Quick Links</h4>
            <ul className="space-y-2">
              <li><a href="/#features" className="text-white/70 hover:text-white transition-colors">Features</a></li>
              <li><a href="/#demo" className="text-white/70 hover:text-white transition-colors">Demo</a></li>
              <li><a href="/#about" className="text-white/70 hover:text-white transition-colors">About</a></li>
            </ul>
          </motion.div>

          {/* Contact */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <h4 className="text-lg font-semibold mb-4">Contact</h4>
            <div className="space-y-3">
              <a href="mailto:shashankrushiya@gmail.com" className="group flex items-center space-x-3 text-white/70 hover:text-white transition-colors">
                <Mail size={18} className="text-white/60 group-hover:text-white transition-colors" />
                <span>shashankrushiya@gmail.com</span>
              </a>
              <a href="https://www.linkedin.com/in/rushiyashashank/" target="_blank" rel="noreferrer" className="group flex items-center space-x-3 text-white/70 hover:text-white transition-colors">
                <Linkedin size={18} className="text-white/60 group-hover:text-white transition-colors" />
                <span>linkedin.com/in/rushiyashashank</span>
              </a>
              <a href="https://github.com/shashankrushiya" target="_blank" rel="noreferrer" className="group flex items-center space-x-3 text-white/70 hover:text-white transition-colors">
                <Github size={18} className="text-white/60 group-hover:text-white transition-colors" />
                <span>github.com/shashankrushiya</span>
              </a>
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="border-t border-gray-800 mt-8 pt-8 text-center"
        >
          <p className="text-gray-400">
            © 2024 GenItinerary. All rights reserved. Built with AI and ❤️ for travelers.
          </p>
        </motion.div>
      </div>
    </footer>
  );
};

export default Footer;
