#!/bin/sh
# Convert Playwright .webm recordings in results/video to GIFs in media/, then report duration and size.
# Keyboard clips are cropped to the table area (720x420 from top-left); the Joyride tour is scaled to 800px wide.
set -e
for f in results/video/*.webm; do
  name=$(basename "$f" .webm)
  case "$name" in
    joyride-*) filter="fps=8,scale=800:-1:flags=lanczos" ;;
    *) filter="fps=10,crop=720:420:0:0" ;;
  esac
  ffmpeg -loglevel error -y -i "$f" -vf "$filter,split[a][b];[a]palettegen=max_colors=64[p];[b][p]paletteuse=dither=bayer" "media/$name.gif"
done
for g in media/*.gif; do
  d=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$g")
  s=$(stat -f %z "$g")
  echo "$g duration_s=$d bytes=$s"
done
