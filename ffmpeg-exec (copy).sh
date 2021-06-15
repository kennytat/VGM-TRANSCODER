#!/usr/bin/env bash
ffmpeg -hide_banner -y -vsync 0 -hwaccel cuvid -c:v h264_cuvid -i /home/vgm-ubuntu/Desktop/sample.mp4 \
-filter_complex \
"[0:v]split=2[v1][v2]; \
[v1]scale_npp=w=1920:h=1080[v1out]; [v2]scale_npp=w=1280:h=720[v2out]" \
-map [v1out] -c:v h264_nvenc -b:v:0 5000k -maxrate:v:0 5350k -bufsize:v:0 7500k -preset slow -profile:v main -g 48 -sc_threshold 0 -g 48 -keyint_min 48 \
-map [v2out] -c:v h264_nvenc -b:v:0 2800k -maxrate:v:0 2996k -bufsize:v:0 4200k -preset slow -profile:v main -g 48 -sc_threshold 0 -g 48 -keyint_min 48 \
-map a:0 -c:a aac -b:a:0 192k -ac 2 \
-map a:0 -c:a aac -b:a:1 128k -ac 2 \
-f hls \
-hls_time 2 \
-hls_playlist_type vod \
-hls_segment_filename /home/vgm-ubuntu/Desktop/test/stream_%v/data%02d.ts \
-master_pl_name master.m3u8 \
-var_stream_map "v:0,a:0,name:1080p v:1,a:1,name:720p" /home/vgm-ubuntu/Desktop/test/stream_%v.m3u8


ffmpeg -hide_banner -y -i beach.mkv \
  -vf scale=w=640:h=360:force_original_aspect_ratio=decrease -c:a aac -ar 48000 -c:v h264 -profile:v main -crf 20 -sc_threshold 0 -g 48 -keyint_min 48 -hls_time 4 -hls_playlist_type vod  -b:v 800k -maxrate 856k -bufsize 1200k -b:a 96k -hls_segment_filename beach/360p_%03d.ts beach/360p.m3u8 \
  -vf scale=w=842:h=480:force_original_aspect_ratio=decrease -c:a aac -ar 48000 -c:v h264 -profile:v main -crf 20 -sc_threshold 0 -g 48 -keyint_min 48 -hls_time 4 -hls_playlist_type vod -b:v 1400k -maxrate 1498k -bufsize 2100k -b:a 128k -hls_segment_filename beach/480p_%03d.ts beach/480p.m3u8 \
  -vf scale=w=1280:h=720:force_original_aspect_ratio=decrease -c:a aac -ar 48000 -c:v h264 -profile:v main -crf 20 -sc_threshold 0 -g 48 -keyint_min 48 -hls_time 4 -hls_playlist_type vod -b:v 2800k -maxrate 2996k -bufsize 4200k -b:a 128k -hls_segment_filename beach/720p_%03d.ts beach/720p.m3u8 \
  -vf scale=w=1920:h=1080:force_original_aspect_ratio=decrease -c:a aac -ar 48000 -c:v h264 -profile:v main -crf 20 -sc_threshold 0 -g 48 -keyint_min 48 -hls_time 4 -hls_playlist_type vod -b:v 5000k -maxrate 5350k -bufsize 7500k -b:a 192k -hls_segment_filename beach/1080p_%03d.ts beach/1080p.m3u8

  ffmpeg -hwaccel_output_format cuda -i /home/vgm-ubuntu/Desktop/MS.mp4 -c:a aac -c:v h264_nvenc -c:s webvtt -crf 20 \
-vf hwupload_cuda,yadif_cuda=0:-1:0,scale_npp=w=960:h=540:interp_algo=linear \
    -b:v 2000k -force_key_frames:v "expr:gte(t,n_forced*2.000)" -hls_time 6 -hls_playlist_type event -hls_flags \
    delete_segments+independent_segments+discont_start+program_date_time \
    -hls_segment_filename test/file_960_%06d.ts test/stream960.m3u8 \
-vf scale=w=1280:h=720 \
    -b:v 2800k -force_key_frames:v "expr:gte(t,n_forced*2.000)" -hls_time 6 -hls_playlist_type event -hls_flags \
    delete_segments+independent_segments+discont_start+program_date_time \
    -hls_segment_filename test/file_1280_%06d.ts test/stream1280.m3u8