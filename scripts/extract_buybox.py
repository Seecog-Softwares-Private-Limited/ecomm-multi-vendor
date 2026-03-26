# One-off: extract buy box inner to buyBoxCard in ProductDetailPage.tsx
path = "src/components/ProductDetailPage.tsx"
with open(path, encoding="utf-8") as f:
    s = f.read()

if "const buyBoxCard" in s:
    print("buyBoxCard already present, skipping extraction")
    raise SystemExit(0)

marker = "{/* ── RIGHT: Buy Box"
i0 = s.find(marker)
if i0 < 0:
    raise SystemExit("RIGHT marker not found")

inner_needle = '''          <div
            style={{
              border: "1px solid #E5E7EB",
              borderRadius: 12,
              padding: "20px",'''
abs_inner = s.find(inner_needle, i0)
if abs_inner < 0:
    raise SystemExit("inner card not found")

chunk = s[abs_inner:]
depth = 0
j = 0
end_pos = None
while j < len(chunk):
    if chunk.startswith("<div", j) and (j + 4 >= len(chunk) or chunk[j + 4] in " \n/>"):
        depth += 1
        j = chunk.find(">", j) + 1
        continue
    if chunk.startswith("</div>", j):
        depth -= 1
        j += 6
        if depth == 0:
            end_pos = abs_inner + j
            break
        continue
    j += 1
if end_pos is None:
    raise SystemExit("matching close not found")

inner_jsx = s[abs_inner:end_pos].strip()
desc = "{/* ── Product Description"
old_right_end = s.find(desc, i0)
if old_right_end < 0:
    raise SystemExit("description marker not found")
old_block = s[i0:old_right_end]

hook = "  };\n\n  return (\n    <div\n      className=\"w-full min-h-screen\""
if hook not in s:
    raise SystemExit("return hook not found")

new_right = """        {/* ── RIGHT: Buy Box (desktop) ──────────────────────────────────────── */}
        <div className="hidden w-full shrink-0 self-start lg:sticky lg:top-4 lg:block lg:w-[280px]">
          {buyBoxCard}
        </div>
      </div>

"""

indented = inner_jsx.replace("\n", "\n    ")
insert_buy = f"  }};\n\n  const buyBoxCard = (\n    {indented}\n  );\n\n  return (\n    <div\n      className=\"w-full min-h-screen\""

s = s.replace(hook, insert_buy, 1)
s = s.replace(old_block, new_right, 1)

with open(path, "w", encoding="utf-8") as f:
    f.write(s)
print("ok buyBoxCard len", len(inner_jsx))
