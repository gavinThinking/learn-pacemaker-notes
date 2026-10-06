.PHONY: check

# 本地质量门，提交前跑。仓库不用 GitHub Actions。
check:
	npm run -s build
	npm run -s assets:check
	node scripts/check-boundary.mjs
	node scripts/check-links.mjs
	@test ! -d .github/workflows || (echo "不许有 .github/workflows" && exit 1)
	@! git grep --untracked -nI -E "[[:space:]]+$$" -- . ":!*.svg" || (echo "上面这些行有行尾空白" && exit 1)
