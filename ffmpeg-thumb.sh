#!/usr/bin/env bash

# Declare variable for inputpath and outputpath, remove quotation marks
inPath=$(sed -e 's/^"//' -e 's/"$//' <<<"$1")
outPath=$(sed -e 's/^"//' -e 's/"$//' <<<"$2")
mkdir -p "$outPath"/{1080,720,480} && cd "$outPath" &&
	ffmpeg -v quiet -y -ss 00:00:05 -hwaccel cuvid -c:v h264_cuvid -threads 1 -skip_frame nokey -i "${inPath}" \
		-vf select='not(mod(n\,5))',scale_npp=1920:1080,hwdownload,format=nv12,fps=1/7 -r 0.1 -frames:v 7 -vsync vfr -q:v 2 -vcodec libwebp -lossless 0 -compression_level 6 -qscale 100 "$outPath"/1080/%01d.webp \
		-vf select='not(mod(n\,5))',scale_npp=1280:720,hwdownload,format=nv12,fps=1/7 -r 0.1 -frames:v 7 -vsync vfr -q:v 2 -vcodec libwebp -lossless 0 -compression_level 6 -qscale 100 "$outPath"/720/%01d.webp \
		-vf select='not(mod(n\,5))',scale_npp=854:480,hwdownload,format=nv12,fps=1/7 -r 0.1 -frames:v 7 -vsync vfr -q:v 2 -vcodec libwebp -lossless 0 -compression_level 6 -qscale 100 "$outPath"/480/%01d.webp \
		-vf select='not(mod(n\,5))',scale_npp=640:360,hwdownload,format=nv12,fps=1/7 -r 0.1 -frames:v 7 -vsync vfr -q:v 2 -vcodec libwebp -lossless 0 -compression_level 6 -qscale 100 "$outPath"/360/%01d.webp \
		-vf select='not(mod(n\,5))',scale_npp=426:240,hwdownload,format=nv12,fps=1/7 -r 0.1 -frames:v 7 -vsync vfr -q:v 2 -vcodec libwebp -lossless 0 -compression_level 6 -qscale 100 "$outPath"/240/%01d.webp
