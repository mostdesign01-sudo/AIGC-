#!/bin/bash
# 双段叠拼 GIF（a 上 b 下，vstack，无 pad），每段 2× 速度；整张叠拼 GIF ≤10MB（单段同样 ≤10MB）。
# 每段先用 make_gifs.py 的黑边检测（letterbox/pillarbox，整行/整列 luma<24）裁掉黑边，
# 再 scale+居中裁切铺满 W×H —— 中间拼缝不会出现黑带。
# 用法：make_stacked_gif_under10m.sh SRC SLUG A_START B_START [SEG=10] [FPS=10] [COLORS=96] [CROP_Y=center]
# 环境变量：OUT（默认 gifs）、PREVIEWS（默认 previews）、NO_AUTOCROP=1 关闭去黑边
set -euo pipefail
SRC="$1"; SLUG="$2"; A_START="$3"; B_START="$4"
SEG="${5:-10}"; FPS="${6:-10}"; COLORS="${7:-96}"; CROP_Y="${8:-center}"
OUT="${OUT:-gifs}"; PREVIEWS="${PREVIEWS:-previews}"
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
MAKE_GIFS="${MAKE_GIFS:-$HERE/make_gifs.py}"
WORK="$(mktemp -d /tmp/gifwork-stacked.XXXXXX)"; trap 'rm -rf "$WORK"' EXIT
mkdir -p "$OUT" "$PREVIEWS"

bar_crop() {  # $1=start $2=seg → 打印 "crop=...,"（无黑边时为空）
  if [ "${NO_AUTOCROP:-0}" = "1" ]; then return 0; fi
  python3 "$MAKE_GIFS" "$SRC" --slug "$SLUG" --orientation landscape --a-start "$1" --seg "$2" --print-crop 2>/dev/null </dev/null || true
}

encode() {
  local W="$1" H="$2" COL="$3" SEG_L="$4"
  local CROP
  if [ "$CROP_Y" = "center" ]; then CROP="crop=${W}:${H}"; else CROP="crop=${W}:${H}:(iw-${W})/2:${CROP_Y}"; fi
  for pair in "a:${A_START}" "b:${B_START}"; do
    local tag="${pair%%:*}" start="${pair##*:}"
    local BARS VF
    BARS="$(bar_crop "$start" "$SEG_L")"
    [ -n "$BARS" ] && echo "  [$tag] 去黑边 ${BARS%,}"
    VF="${BARS}setpts=0.5*PTS,fps=${FPS},scale=${W}:${H}:force_original_aspect_ratio=increase:flags=lanczos,${CROP}"
    local pal="$WORK/${SLUG}-${tag}-pal.png"
    ffmpeg -y -hide_banner -loglevel error -ss "$start" -t "$SEG_L" -i "$SRC" \
      -vf "$VF,palettegen=stats_mode=diff:max_colors=${COL}" "$pal"
    ffmpeg -y -hide_banner -loglevel error -ss "$start" -t "$SEG_L" -i "$SRC" -i "$pal" \
      -filter_complex "[0:v]$VF[x];[x][1:v]paletteuse=dither=bayer:bayer_scale=5:diff_mode=rectangle" \
      -loop 0 "$OUT/${SLUG}-${tag}.gif"
  done
  ffmpeg -y -hide_banner -loglevel error -i "$OUT/${SLUG}-a.gif" -i "$OUT/${SLUG}-b.gif" \
    -filter_complex "[0:v][1:v]vstack=inputs=2[v]" -map "[v]" -loop 0 "$OUT/${SLUG}-stacked.gif"
}

# Ladder until ≤10MB, prefer keeping length then width
for cfg in \
  "720 406 96 $SEG" \
  "720 406 64 $SEG" \
  "720 406 80 8" \
  "640 360 64 8" \
  "640 360 48 8"
do
  set -- $cfg
  encode "$1" "$2" "$3" "$4"
  BYTES=$(stat -c%s "$OUT/${SLUG}-stacked.gif")
  echo "try ${1}x${2} c${3} seg${4} -> $(du -h "$OUT/${SLUG}-stacked.gif" | cut -f1) ($BYTES)"
  if [ "$BYTES" -le 10485760 ]; then break; fi
done

BYTES=$(stat -c%s "$OUT/${SLUG}-stacked.gif")
ffmpeg -y -hide_banner -loglevel error -i "$OUT/${SLUG}-stacked.gif" -frames:v 1 "$PREVIEWS/${SLUG}-stacked.jpg"
WH=$(ffprobe -v error -select_streams v:0 -show_entries stream=width,height -of csv=s=x:p=0 "$OUT/${SLUG}-stacked.gif")
DUR=$(ffprobe -v error -show_entries format=duration -of default=nw=1:nk=1 "$OUT/${SLUG}-stacked.gif")
echo "OK $SLUG ${WH} dur=${DUR}s $(du -h "$OUT/${SLUG}-stacked.gif" | cut -f1)"
if [ "$BYTES" -gt 10485760 ]; then echo "FAIL $SLUG still >10MB"; exit 1; fi
