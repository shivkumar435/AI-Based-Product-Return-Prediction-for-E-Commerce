import re

path = 'src/pages/LandingPage.jsx'

with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# Add motion import
content = content.replace("import { Link } from 'react-router-dom';", "import { Link } from 'react-router-dom';\nimport { motion } from 'framer-motion';")

# Add stagger animation to feature cards
# Find: <div key={i} className="p-6 bg-gray-50... group">
content = re.sub(
    r'<div key=\{i\} className="p-6 bg-gray-50([^"]*)">',
    r'<motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.1 }} className="p-6 bg-gray-50\1">',
    content
)
content = re.sub(r'</p>\n              </div>', r'</p>\n              </motion.div>', content)

# Wrap major sections in motion.div
# Section 1: Features
content = content.replace(
    '<div className="text-center mb-14">',
    '<motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="text-center mb-14">'
)
content = content.replace(
    '</p>\n          </div>\n          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">',
    '</p>\n          </motion.div>\n          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">'
)

# Section 2: How It Works
content = content.replace(
    '<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative">',
    '<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative">'
)
# We already replaced the text-center div above. Since both have the same class `text-center mb-14`, it will apply to both!

# Add stagger to steps
content = re.sub(
    r'<div key=\{i\} className="relative bg-white([^"]*)">',
    r'<motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.1 }} className="relative bg-white\1">',
    content
)
# close motion.div for steps
content = re.sub(
    r'</p>\n              </div>\n            }\)\}',
    r'</p>\n              </motion.div>\n            ))}',
    content
)

# We need to add animated stats counter and testimonials.
# We will inject these after Tech Stack.

animated_stats = """
      {/* Animated Stats */}
      <section className="py-20 bg-indigo-600 dark:bg-indigo-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { label: 'Predictions Made', value: '2000+' },
              { label: 'Uptime', value: '99.9%' },
              { label: 'ML Models Compared', value: '4' },
              { label: 'Features Analyzed', value: '12' }
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.5 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                <div className="text-4xl font-extrabold mb-2">{stat.value}</div>
                <div className="text-indigo-200 text-sm font-medium">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
"""

testimonials = """
      {/* Testimonials */}
      <section className="py-20 bg-white dark:bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest mb-2">Trusted By</p>
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-12">What Our Partners Say</h2>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { quote: "ReturnSense cut our false return claims by 40% in just two months.", author: "Sarah Jenkins", role: "E-commerce Director" },
              { quote: "The real-time risk scoring allows us to process high-value orders with confidence.", author: "Michael Chen", role: "Operations Lead" },
              { quote: "Integration was seamless. The prediction accuracy has consistently stayed above 85%.", author: "Emma Davis", role: "Tech Lead" }
            ].map((t, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="p-6 bg-gray-50 dark:bg-slate-900 rounded-2xl text-left"
              >
                <div className="text-indigo-600 mb-4">
                  <svg className="w-8 h-8 opacity-50" fill="currentColor" viewBox="0 0 24 24"><path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" /></svg>
                </div>
                <p className="text-gray-600 dark:text-gray-300 mb-6 italic">"{t.quote}"</p>
                <div>
                  <p className="font-semibold text-slate-900 dark:text-white">{t.author}</p>
                  <p className="text-sm text-gray-500">{t.role}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
"""

content = content.replace('{/* Tech Stack */}', animated_stats + testimonials + '\n      {/* Tech Stack */}')

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)

print('Updated LandingPage.jsx')
