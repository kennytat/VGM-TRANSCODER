#!/usr/bin/env bash

# Declare variable for inputpath and outputpath, remove quotation marks
inPath=$(sed -e 's/^"//' -e 's/"$//' <<<"$1")
outPath=$(sed -e 's/^"//' -e 's/"$//' <<<"$2")
fileType=$3
# Rename input path if contain whitespace to underscore
# rpws="${inPath// /_}"
# # extract file name and get output directory
# filename="${rpws##*/}"
# out="$outPath/${filename%.*}"
# Run ffmpeg & ffprobe command for each file input, log output progression to hidden file and remove it when done

if [[ $fileType == 'video' ]]; then
	mkdir -p $outPath/{1080,720,480} &&
		ffmpeg -progress pipe:1 -stats_period 0.5 -v quiet -vsync 0 -hwaccel cuvid -c:v h264_cuvid -i "${inPath}" \
			-filter_complex \
			"[0:v]split=3[v1][v2][v3]; \
[v1]scale_npp=w=1920:h=1080[v1out]; [v2]scale_npp=w=1280:h=720[v2out]; [v3]scale_npp=w=854:h=480[v3out]" \
			-map "[v1out]" -c:v h264_nvenc -b:v:0 5M -maxrate:v:0 5M -minrate:v:0 5M -bufsize:v:0 10M -preset slow -g 48 -sc_threshold 0 -keyint_min 48 \
			-map "[v2out]" -c:v h264_nvenc -b:v:0 3M -maxrate:v:0 3M -minrate:v:0 3M -bufsize:v:0 6M -preset slow -g 48 -sc_threshold 0 -keyint_min 48 \
			-map "[v3out]" -c:v h264_nvenc -b:v:0 2M -maxrate:v:0 2M -minrate:v:0 2M -bufsize:v:0 4M -preset slow -g 48 -sc_threshold 0 -keyint_min 48 \
			-map a:0 -c:a aac -b:a:0 192k -ac 2 \
			-map a:0 -c:a aac -b:a:1 128k -ac 2 \
			-map a:0 -c:a aac -b:a:2 96k -ac 2 \
			-f hls \
			-hls_time 10 \
			-hls_key_info_file enc.keyinfo \
			-hls_playlist_type vod \
			-hls_flags independent_segments \
			-hls_segment_type mpegts \
			-hls_segment_filename $outPath/stream_%v/data%01d.vgmx \
			-master_pl_name playlist.m3u8 \
			-var_stream_map "v:0,a:0,name:1080p v:1,a:1,name:720p v:2,a:2,name:480p" $outPath/stream_%v/segment.m3u8 &&
		ffmpeg -v quiet -y -ss 00:00:10 -hwaccel cuda -hwaccel_output_format cuda -i "${inPath}" \
			-vf select='eq(pict_type\,I)',scale_npp=1920:1080,hwdownload,format=nv12,fps=1/7 -frames:v 7 -vsync vfr -q:v 2 -f image2 $outPath/1080/%01d.png \
			-vf select='eq(pict_type\,I)',scale_npp=1280:720,hwdownload,format=nv12,fps=1/7 -frames:v 7 -vsync vfr -q:v 2 -f image2 $outPath/720/%01d.png \
			-vf select='eq(pict_type\,I)',scale_npp=854:480,hwdownload,format=nv12,fps=1/7 -frames:v 7 -vsync vfr -q:v 2 -f image2 $outPath/480/%01d.png
else
	mkdir -p $outPath &&
		ffmpeg -progress pipe:1 -stats_period 0.5 -v quiet -vsync 0 -hwaccel cuvid -c:v h264_cuvid -i "${inPath}" \
			-map 0:a -c:a aac -b:a:0 192k -ac 2 \
			-f hls \
			-hls_time 10 \
			-preset slow \
			-hls_playlist_type vod \
			-hls_flags independent_segments \
			-hls_segment_type mpegts \
			-hls_segment_filename $outPath/data%01d.vgmx \
			$outPath/playlist.m3u8
fi
cp ./enc.key $outPath
