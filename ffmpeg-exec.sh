#!/usr/bin/env bash
i=0
for f in `find $1 -name '*.mkv'`; do echo ${i} > ffprobe-frame.txt 
ffprobe -v quiet -select_streams v:0 -show_entries format=duration,stream_index:stream=avg_frame_rate -of default=noprint_wrappers=1 $f >> ffprobe-frame.txt \
&& \
ffmpeg -progress ffmpeg-progress.txt -stats_period 0.5 -v quiet -vsync 0 -hwaccel cuvid -c:v h264_cuvid -i $f \
-filter_complex \
"[0:v]split=3[v1][v2][v3]; \
[v1]scale_npp=w=1920:h=1080[v1out]; [v2]scale_npp=w=1280:h=720[v2out]; [v3]scale_npp=w=854:h=480[v3out]" \
-map [v1out] -c:v h264_nvenc -b:v:0 5M -maxrate:v:0 5M -minrate:v:0 5M -bufsize:v:0 10M -preset slow -g 48 -sc_threshold 0 -keyint_min 48 \
-map [v2out] -c:v h264_nvenc -b:v:0 3M -maxrate:v:0 3M -minrate:v:0 3M -bufsize:v:0 6M -preset slow -g 48 -sc_threshold 0 -keyint_min 48 \
-map [v3out] -c:v h264_nvenc -b:v:0 2M -maxrate:v:0 2M -minrate:v:0 2M -bufsize:v:0 4M -preset slow -g 48 -sc_threshold 0 -keyint_min 48 \
-map a:0 -c:a aac -b:a:0 96k -ac 2 \
-map a:0 -c:a aac -b:a:1 96k -ac 2 \
-map a:0 -c:a aac -b:a:2 48k -ac 2 \
-f hls \
-hls_time 2 \
-hls_key_info_file enc.keyinfo \
-hls_playlist_type vod \
-hls_flags independent_segments \
-hls_segment_type mpegts \
-hls_segment_filename ${f//$1/$2}/stream_%v/data%02d.ts \
-master_pl_name master.m3u8 \
-var_stream_map "v:0,a:0,name:1080p v:1,a:1,name:720p v:2,a:2,name:480p" ${f//$1/$2}/stream_%v.m3u8
((i++)); done