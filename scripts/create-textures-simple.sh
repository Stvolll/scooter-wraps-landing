#!/bin/bash
# Simple script to create colored PNG textures using ImageMagick or sips

cd "$(dirname "$0")/../public/textures"

# Colors in hex
declare -A colors=(
  ["neon"]="00FF88"
  ["holo"]="0066FF"
  ["carbon"]="282828"
  ["racing"]="FF0066"
)

# Create textures for each model
for model in vision lead sh pcx nvx; do
  mkdir -p "$model"
  
  case $model in
    vision|sh|nvx)
      designs=("neon" "holo" "carbon" "racing")
      ;;
    lead|pcx)
      designs=("neon" "holo" "carbon")
      ;;
  esac
  
  for design in "${designs[@]}"; do
    file="${model}/${design}.png"
    color="${colors[$design]}"
    
    # Skip if real PNG exists
    if [ -f "$file" ] && file "$file" | grep -q "PNG image"; then
      echo "✓ Exists: $file"
      continue
    fi
    
    # Try to create using available tools
    if command -v convert &> /dev/null; then
      convert -size 2048x2048 xc:"#$color" "$file"
      echo "✓ Created: $file (ImageMagick)"
    elif command -v sips &> /dev/null; then
      # Create using sips (macOS)
      # Create a temporary 1x1 image and resize
      echo "Creating $file with sips..."
      # Use a workaround: create via base64 encoded minimal PNG
      echo "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==" | base64 -d > /tmp/temp.png 2>/dev/null
      sips -s format png --resampleHeightWidthMax 2048 /tmp/temp.png --out "$file" 2>/dev/null
      rm -f /tmp/temp.png
      echo "✓ Created: $file (sips)"
    else
      # Create minimal valid PNG (1x1 pixel, will be scaled by browser)
      printf '\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x02\x00\x00\x00\x90wS\xde\x00\x00\x00\tpHYs\x00\x00\x0b\x13\x00\x00\x0b\x13\x01\x00\x9a\x9c\x18\x00\x00\x00\nIDATx\x9cc\xf8\x00\x00\x00\x01\x00\x01\x00\x00\x00\x00IEND\xaeB`\x82' > "$file"
      echo "⚠ Created minimal PNG: $file (replace with actual 2048x2048 image)"
    fi
  done
done

echo ""
echo "✅ Texture placeholders created!"
echo "⚠️  For production, replace these with actual 2048x2048 PNG texture images"








