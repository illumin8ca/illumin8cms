#!/bin/bash
set -e

# Ensure script is run from project root
dirname=$(basename "$PWD")
if [[ "$dirname" == "scripts" ]]; then
  cd ../..
fi

# Initialize git if not already initialized
if [ ! -d .git ]; then
  git init
fi

# Add remote if not already set
if ! git remote | grep -q origin; then
  git remote add origin https://github.com/illumin8ca/illumin8cms.git
fi

# Create README.md with project info
cat > README.md <<'EOF'
# Illumin8CMS

Illumin8CMS is a custom Content Management System (CMS) designed to work strictly with [Astro](https://astro.build/).

- **Cloudflare Pages**: Built specifically for seamless deployment on [Cloudflare Pages](https://pages.cloudflare.com/).
- **Cloudflare Storage (R2)**: Uses [Cloudflare R2](https://www.cloudflare.com/products/r2/) for scalable object storage.
- **Cloudflare Databases (D1)**: Integrates with [Cloudflare D1](https://developers.cloudflare.com/d1/) for serverless SQL databases.

This project is developed for illuminate clients, but is a public repository—anyone is free to use, modify, and contribute. It is totally free and open source under the MIT license.

## License

MIT License. See [LICENSE](LICENSE) for details.
EOF

# Add and commit README.md
if ! git status --porcelain | grep -q README.md; then
  git add README.md
  git commit -m "Add initial README for Illumin8CMS"
fi

# Push to main branch (create main if not exists)
git branch -M main
git push -u origin main || echo "Push failed (likely due to auth or empty repo). Please push manually if needed." 