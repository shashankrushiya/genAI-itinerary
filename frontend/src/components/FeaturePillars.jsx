import React from 'react';
import { motion } from 'framer-motion';
import { Route, User, Clock, Download } from 'lucide-react';
import { staggerContainer, fadeInUp } from '../lib/motion';

const FeaturePillars = () => {
  const features = [
    {
      icon: Route,
      title: "Smart Routes",
      description: "AI-optimized itineraries that minimize travel time and maximize experiences"
    },
    {
      icon: User,
      title: "Personalization",
      description: "Tailored recommendations based on your interests, budget, and travel style"
    },
    {
      icon: Clock,
      title: "Live Constraints",
      description: "Real-time updates for weather, closures, and local events"
    },
    {
      icon: Download,
      title: "Export Ready",
      description: "Generate PDFs, share with friends, or sync with your calendar"
    }
  ];

  return (
    <section id="features" className="py-20 bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          variants={staggerContainer}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <motion.h2 
            variants={fadeInUp}
            className="text-4xl lg:text-5xl font-semibold text-white mb-6"
          >
            Why Choose GenItinerary?
          </motion.h2>
          <motion.p 
            variants={fadeInUp}
            className="text-xl text-white/70 max-w-3xl mx-auto"
          >
            Our AI-powered platform transforms how you plan and experience travel, 
            making every trip unforgettable.
          </motion.p>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          className="grid md:grid-cols-2 lg:grid-cols-4 gap-8"
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              variants={fadeInUp}
              className="group"
            >
              <div className="bg-white/5 rounded-2xl p-8 h-full hover:shadow-xl transition-all duration-300 group-hover:scale-105 border border-white/10">
                <div className="bg-white/10 w-16 h-16 rounded-xl flex items-center justify-center mb-6 group-hover:bg-white/20 transition-colors">
                  <feature.icon className="text-white" size={32} />
                </div>
                <h3 className="text-xl font-semibold text-white mb-4">
                  {feature.title}
                </h3>
                <p className="text-white/70 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default FeaturePillars;
