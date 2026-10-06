import glob
import re

files = glob.glob(r'D:\customer churn prediction\MLVerse\frontend\src\components\*.tsx')

for path in files:
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Inputs: text-white -> text-[#1f1f1f]
    content = re.sub(r'(<input[^>]*className="[^"]*)text-white', r'\1text-[#1f1f1f]', content)
    content = re.sub(r'(<select[^>]*className="[^"]*)text-white', r'\1text-[#1f1f1f]', content)
    content = re.sub(r'(<textarea[^>]*className="[^"]*)text-white', r'\1text-[#1f1f1f]', content)

    # 2. Heading text-white -> text-[#1f1f1f]
    content = re.sub(r'(<h[1-6][^>]*className="[^"]*)text-white', r'\1text-[#1f1f1f]', content)

    # 3. Table cells text-white -> text-[#1f1f1f]
    content = re.sub(r'(<td[^>]*className="[^"]*)text-white', r'\1text-[#1f1f1f]', content)
    content = re.sub(r'(<th[^>]*className="[^"]*)text-white', r'\1text-[#1f1f1f]', content)

    # 4. Standalone text-white on light cards
    content = content.replace('text-white font-mono', 'text-[#1f1f1f] font-mono')
    content = content.replace('font-mono text-white', 'font-mono text-[#1f1f1f]')
    content = content.replace('font-bold text-white', 'font-medium text-[#1f1f1f]')
    content = content.replace('font-semibold text-white', 'font-medium text-[#1f1f1f]')

    # 5. Buttons: replace rounded-xl indigo with btn-pill-dark
    content = re.sub(r'px-6 py-3(\.5)? rounded-xl bg-indigo-600[^\"]*text-white[^\"]*', 'btn-pill-dark ', content)
    content = re.sub(r'px-4 py-2 rounded-xl bg-indigo-600[^\"]*text-white[^\"]*', 'btn-pill-dark !py-2 text-[13px] ', content)
    content = re.sub(r'px-5 py-2(\.5)? rounded-xl bg-indigo-600[^\"]*text-white[^\"]*', 'btn-pill-dark !py-2.5 text-[14px] ', content)

    # 6. Inputs geometry to rounded-[12px] or rounded-full
    content = content.replace('rounded-lg bg-[#f7f7f7]', 'rounded-full px-4 bg-[#f7f7f7]')
    content = content.replace('rounded-xl bg-[#f7f7f7]', 'rounded-[20px] bg-[#f7f7f7]')

    # 7. Subtle text colors
    content = content.replace('text-indigo-400', 'text-[#1f1f1f]')
    content = content.replace('text-indigo-300', 'text-[#4c4c4c]')
    content = content.replace('bg-indigo-600', 'bg-[#1f1f1f]')
    content = content.replace('bg-indigo-500', 'bg-[#1f1f1f]')

    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)

print(f"Successfully processed {len(files)} files for Revolut monochrome style.")
