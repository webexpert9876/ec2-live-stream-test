const config = {
  server: {
    port: process.env.SERVER_PORT
  },
  rtmp: {
    port: 1935,
    chunk_size: 60000,
    gop_cache: true,
    ping: 30,
    ping_timeout: 60
  },
  http: {
    port: 8000,
    mediaroot: './media',
    allow_origin: '*'
  },
  trans: {
    ffmpeg: '/usr/bin/ffmpeg',
    tasks: [
      {
        app: 'live',
        mp4: true,
        mp4Flags: '[movflags=frag_keyframe+empty_moov]',
        hls: true,
        hlsFlags: '[hls_time=2:hls_list_size=3:hls_flags=delete_segments]',
        dash: true,
        dashFlags: '[f=dash:window_size=3:extra_window_size=5]'
      }
    ]
  },
  fission: {
    ffmpeg: '/usr/bin/ffmpeg',
      tasks: [
        {
          rule: "live/*",
          model: [
            {
              ab: "128k",
              vb: "1500k",
              vs: "720x1280",
              vf: "60",
            },
            {
              ab: "96k",
              vb: "1000k",
              vs: "480x854",
              vf: "24",
            },
            {
              ab: "64k",
              vb: "600k",
              vs: "360x640",
              vf: "20",
            },
          ]
        }
      ]
  }
};

module.exports = config;