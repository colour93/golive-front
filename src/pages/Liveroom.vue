<template>
  <div class="liveroom-container" v-if="userStatus === 1">
    <div class="header">
      <div class="profile-info">
        <n-badge value="未认证" :show="userInfo.verified === 0">
          <n-avatar
            :size="48"
            :src="userInfo.avatarUrl"
            fallback-src="/avatar.png"
          />
        </n-badge>
        <div class="profile-name">
          <n-text class="nickname">{{ userInfo.nickname }}</n-text>
          <n-text class="username">{{ userInfo.username }}</n-text>
        </div>
      </div>
    </div>
    <div class="content">
      <div id="video" ref="player"></div>
      <n-alert title="Tips" type="info" closable>
        如遇播放黑屏，请尝试在 右下角
        切换编码；如遇很多人都播放黑屏，请让主播重新推流
      </n-alert>
    </div>
  </div>
  <not-found-page v-if="userStatus === -1"></not-found-page>
</template>

<style scoped>
.liveroom-container {
  margin: auto;
  padding: 40px 0px;
  max-width: 1280px;
}

.header {
  margin: 20px 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.profile-info {
  display: flex;
  align-items: center;
}

.profile-name {
  margin-left: 30px;
  display: flex;
  flex-direction: column;
}

.nickname {
  font-size: 20px;
}

.username {
  color: var(--indigo-a100);
  font-size: 14px;
}

#video {
  width: 100%;
  height: auto;
}
</style>

<script setup lang="ts">
import flvjs from "flv.js";
import Hls from "hls.js";
import DPlayer from "dplayer";

import platform from "platform";

import { useHead } from "@vueuse/head";
import { onBeforeRouteUpdate, useRoute } from "vue-router";
import {
  ref,
  onMounted,
  reactive,
  watch,
  onBeforeUnmount,
} from "vue";
import axios from "axios";
import { useMessage } from "naive-ui";

import NotFoundPage from "../pages/NotFound.vue";

const player = ref();
let dplayer: any;

const route = useRoute();
const message = useMessage();

const roomid = ref(route.params.roomid);
const userStatus = ref(0);

const osFamily = platform.parse(navigator.userAgent).os.family;

onMounted(() => {
  loadLiveroom();
});
onBeforeRouteUpdate((to) => {
  roomid.value = to.params.roomid;
  loadLiveroom();
});
onBeforeUnmount(() => {
  dplayer.destroy();
});

const userInfo = reactive({
  nickname: "昵称",
  username: "用户名",
  verified: 1,
  avatarUrl: "",
});

watch(
  () => userInfo.nickname,
  (newNickname: string) => {
    useHead({
      title: `${newNickname} - GoLive`,
    });
  }
);

async function loadLiveroom() {
  const result = await axios
    .get("/api/live/get_info", {
      params: {
        roomid: roomid.value,
      },
    })
    .then((resp) => resp.data);

  if (result.code == 404) {
    userStatus.value = -1;
    return;
  } else if (result.code != 0) {
    message.error(result.msg);
    return;
  }

  userStatus.value = 1;

  const { user, stream } = result.data;

  userInfo.username = user.username;
  userInfo.nickname = user.nickname;
  userInfo.verified = user.verified;
  userInfo.avatarUrl = user.avatarUrl;

  if (stream) createPlayer(stream);
}

function createPlayer(stream: { hls: string; flv: string }) {
  let count = 0;

  if (!document.getElementById("video") && count <= 50) {
    setTimeout(() => {
      createPlayer(stream);
      count++;
    }, 200);
    return;
  }

  dplayer = new DPlayer({
    container: player.value,
    live: true,
    airplay: true,
    chromecast: true,
    autoplay: true,
    screenshot: true,
    video: {
      quality: [
        {
          name: "FLV (推荐)",
          url: stream.flv,
          type: "customFlv",
        },
        {
          name: "HLS (备用)",
          url: stream.hls,
          type: "customHls",
        },
      ],
      defaultQuality: osFamily === "iOS" ? 1 : 0,
      customType: {
        customFlv: (video: HTMLVideoElement) => {
          const flvPlayer = flvjs.createPlayer({
            type: "flv",
            url: video.src,
            isLive: true,
          });
          flvPlayer.on(flvjs.Events.ERROR, (errorType, errorContent) => {
            if (errorType === flvjs.ErrorTypes.MEDIA_ERROR) {
              dplayer.notice("FLV 解码错误，尝试切换至 HLS");
              dplayer.switchQuality(1);
            } else {
              dplayer.notice(
                "FLV 播放错误: " + errorType + " - " + errorContent
              );
            }
          });
          flvPlayer.attachMediaElement(video);
          flvPlayer.load();
        },
        customHls: (video: HTMLVideoElement) => {
          const hls = new Hls();
          hls.loadSource(video.src);
          hls.attachMedia(video);
        },
      },
    },
  });

  dplayer.on("canplay", () => {
    if (osFamily === "iOS" && dplayer.qualityIndex != 1) {
      dplayer.notice("iOS 用户建议使用 HLS");
    }
    dplayer.play();
  });
}
</script>
