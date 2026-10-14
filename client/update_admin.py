import os, re

admin_pages = ['ManageProductsPage.jsx', 'ManageUsersPage.jsx', 'ManageOrdersPage.jsx', 'PredictionReportsPage.jsx', 'HighRiskPage.jsx', 'AnalyticsPage.jsx']
dir_path = 'src/pages/admin'

for file_name in admin_pages:
    path = os.path.join(dir_path, file_name)
    if not os.path.exists(path):
        continue
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Imports
    if 'PageTransition' not in content:
        content = re.sub(r'import LoadingSpinner[^;]+;\n', '', content)
        content = content.replace("import DataTable", "import { motion } from 'framer-motion';\nimport PageTransition from '../../components/PageTransition';\nimport { SkeletonTable } from '../../components/SkeletonLoader';\nimport DataTable")

    # 2. LoadingSpinner -> SkeletonTable
    content = content.replace('<LoadingSpinner />', '<SkeletonTable />')

    # 3. Wrapping
    if '<PageTransition>' not in content:
        content = re.sub(r'return\s*\(\s*<div[^>]*>', 'return (\n    <PageTransition>\n      <motion.div\n        initial={{ opacity: 0, y: 20 }}\n        animate={{ opacity: 1, y: 0 }}\n        transition={{ duration: 0.5 }}\n      >', content, count=1)
        
        last_div_idx = content.rfind('</div>')
        if last_div_idx != -1:
            content = content[:last_div_idx] + '</motion.div>\n    </PageTransition>' + content[last_div_idx+6:]

    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)

print('Updated admin pages.')
