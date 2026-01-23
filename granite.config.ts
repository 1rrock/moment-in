import { defineConfig } from '@apps-in-toss/web-framework/config';

export default defineConfig({
  appName: 'moment-in',
  brand: {
    displayName: '모먼트인', // 화면에 노출될 앱의 한글 이름으로 바꿔주세요.
    primaryColor: '#3182F6', // 화면에 노출될 앱의 기본 색상으로 바꿔주세요.
    icon: 'https://static.toss.im/appsintoss/9817/5c830b2b-9a33-447d-90f1-52318c90f20c.png', // 화면에 노출될 앱의 아이콘 이미지 주소로 바꿔주세요.
  },
  web: {
    host: '192.168.1.89',
    port: 3000,
    commands: {
      dev: 'next dev',
      build: 'next build',
    },
  },
  permissions: [
    { name: 'camera', access: 'access' }
  ],
  webViewProps: {
    allowsInlineMediaPlayback: true,
    mediaPlaybackRequiresUserAction: false,
  },
  outdir: 'out',
});
