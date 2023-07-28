<template>
  <div class="container">
    <div class="header">
      <n-grid
        x-gap="12"
        y-gap="12"
        :cols="4"
        item-responsive
        responsive="screen"
      >
        <n-gi span="4 m:2 l:1" class="profile-info">
          <n-dropdown
            :options="profilePulldownOptions"
            @select="profilePulldownSelectHandle"
          >
            <n-badge value="未认证" :show="profileInfoValue.verified === 0">
              <n-avatar
                :size="48"
                :src="profileInfoValue.avatarUrl"
                fallback-src="/avatar.png"
              />
            </n-badge>
          </n-dropdown>
          <div class="profile-name">
            <span class="nickname">{{ profileInfoValue.nickname }}</span>
            <span class="username">{{ profileInfoValue.username }}</span>
          </div>
        </n-gi>

        <n-gi span="4 m:2 l:1" class="stream-server-info">
          <n-input-group>
            <n-input
              v-model:value="streamInfoValue.streamServer"
              id="stream-server"
              type="text"
              placeholder="推流服务器地址"
              :readonly="true"
            />
            <n-button type="primary" ghost @click="copy('streamServer')">
              复制推流服务器地址
            </n-button>
          </n-input-group>
        </n-gi>

        <n-gi span="4 m:2 l:1" class="stream-key-info">
          <n-input-group>
            <n-input
              v-model:value="streamInfoValue.streamKey"
              id="stream-key"
              type="text"
              placeholder="推流密钥"
              :readonly="true"
            />
            <n-button type="primary" ghost @click="copy('streamKey')">
              复制推流密钥
            </n-button>
            <n-button
              type="primary"
              @click="updateStreamKey"
              :loading="updateStreamKeyLoading"
            >
              更新
            </n-button>
          </n-input-group>
        </n-gi>

        <n-gi span="4 m:2 l:1" class="stream-key-info">
          <n-input-group>
            <n-input
              v-model:value="streamInfoValue.liveroom"
              id="liveroom"
              type="text"
              placeholder="直播间地址"
              :readonly="true"
            />
            <n-button type="primary" ghost @click="copy('liveroom')">
              复制直播间地址
            </n-button>
          </n-input-group>
        </n-gi>
      </n-grid>
    </div>

    <div class="content">
      <n-alert title="注意" type="info">
        每次推流前 务必 手动更新一次推流密钥
      </n-alert>

      <n-alert title="注意" type="info">
        受限于服务端上行带宽，建议推流码率不超过 8000 kbps
      </n-alert>

      <n-card title="推流教程">
        <n-tabs type="line" animated>
          <n-tab-pane name="pc" tab="Windows / macOS / Linux">
            <a href="https://obsproject.com/"><n-h3 prefix="bar">OBS</n-h3></a>
            <n-text
              >在 <n-text code>设置 -> 直播</n-text> 中，<n-text code
                >服务 -> 自定义...</n-text
              >，<n-text code
                >服务器 ->
                <n-text type="primary">推流服务器地址</n-text></n-text
              >，<n-text code
                >推流码 -> <n-text type="primary">推流密钥</n-text></n-text
              ></n-text
            >
          </n-tab-pane>
          <n-tab-pane name="android" tab="Android"> 待填坑 </n-tab-pane>
          <n-tab-pane name="ios" tab="iOS / iPadOS"> 待填坑 </n-tab-pane>
        </n-tabs>
      </n-card>
    </div>
  </div>

  <n-modal v-model:show="uploadAvatarModal">
    <n-card
      style="max-width: 330px"
      :bordered="true"
      role="dialog"
      aria-modal="true"
    >
      仅支持 jpe | png | webp 格式图片上传 (暂时不支持裁剪)
      <template #footer>
        <n-upload
          class="modal-footer-btn"
          action="/api/user/upload_avatar"
          @before-upload="beforeUploadAvatar"
          accept=".png,.jpeg,.jpg,.webp"
          :max="1"
          name="avatar"
          :show-file-list="false"
          @finish="afterUploadAvatar"
        >
          <n-button class="modal-footer-btn">选择并上传</n-button>
        </n-upload>
      </template>
    </n-card>
  </n-modal>

  <n-modal v-model:show="changePasswordModal">
    <n-card
      style="max-width: 330px"
      :bordered="true"
      role="dialog"
      aria-modal="true"
    >
      <div class="modal-content">
        <n-input
          v-model:value="changePasswordVal"
          placeholder="密码"
          type="password"
        >
          <template #prefix>
            <n-icon :component="LockClosed" />
          </template>
        </n-input>

        <n-input
          v-model:value="changePasswordConfirmVal"
          placeholder="确认密码"
          type="password"
          :status="changePasswordConfirmInputStatus"
          :on-change="inputCheckChangePasswordConfirm"
        >
          <template #prefix>
            <n-icon :component="LockClosedOutline" />
          </template>
        </n-input>
      </div>

      <template #footer
        ><n-button
          type="primary"
          class="modal-footer-btn"
          @click="changePassword"
        >
          修改密码
        </n-button></template
      >
    </n-card>
  </n-modal>
</template>

<style scoped>
.container {
  margin: auto;
  padding: 40px;
  max-width: 1280px;
}

.content > * {
  margin: 20px 0;
}

.header {
  margin: 20px 0;
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
</style>

<script setup lang="ts">
import { useHead } from "@vueuse/head";
import { NIcon, useMessage } from "naive-ui";
import type { UploadFileInfo } from "naive-ui";
import axios from "axios";
import { ref, reactive, onBeforeMount, Component, h, watch } from "vue";

import {
  CloudUploadOutline,
  LogOutOutline,
  LockOpenOutline,
  LockClosedOutline,
  LockClosed,
} from "@vicons/ionicons5";

const message = useMessage();

const emit = defineEmits(["logout"]);

const profileInfoValue = reactive({
  nickname: "昵称",
  username: "用户名",
  verified: 1,
  avatarUrl: "",
});

const streamInfoValue = reactive({
  streamServer: "",
  streamKey: "",
  liveroom: "",
});

const uploadAvatarModal = ref(false);

const changePasswordModal = ref(false);
const changePasswordConfirmInputStatus = ref("");
const changePasswordVal = ref("");
const changePasswordConfirmVal = ref("success");

const updateStreamKeyLoading = ref(false);

watch(
  () => profileInfoValue.nickname,
  (newNickname: string) => {
    useHead({
      title: `${newNickname} - GoLive`,
    });
  }
);

function renderIcon(icon: Component) {
  return () => {
    return h(NIcon, null, {
      default: () => h(icon),
    });
  };
}

const profilePulldownOptions = [
  {
    label: "上传头像",
    key: "uploadAvatar",
    icon: renderIcon(CloudUploadOutline),
  },
  {
    label: "修改密码",
    key: "changePassword",
    icon: renderIcon(LockOpenOutline),
  },
  {
    label: "登出",
    key: "logout",
    icon: renderIcon(LogOutOutline),
  },
];

function profilePulldownSelectHandle(
  key: "uploadAvatar" | "changePassword" | "logout"
) {
  switch (key) {
    case "uploadAvatar":
      uploadAvatarModal.value = true;
      break;

    case "changePassword":
      changePasswordModal.value = true;
      break;

    case "logout":
      logout();
      break;

    default:
      return;
  }
}

function beforeUploadAvatar(data: {
  file: UploadFileInfo;
  fileList: UploadFileInfo[];
}) {
  const whiteList = ["image/jpeg", "image/png", "image/webp"];
  if (data.file.file?.type && !whiteList.includes(data.file.file?.type)) {
    message.error("只能上传 png | jpg | webp 格式的图片文件，请重新上传");
    return false;
  }
  return true;
}

function afterUploadAvatar({
  event,
}: {
  file: UploadFileInfo;
  event?: ProgressEvent;
}) {
  const result = JSON.parse((event?.target as XMLHttpRequest).response);

  if (result.code != 0) {
    message.error(result.msg);
  } else {
    message.success(result.msg);

    // 防止缓存
    const originUrl = new URL(location.origin + profileInfoValue.avatarUrl);

    profileInfoValue.avatarUrl =
      originUrl.pathname + "?_=" + new Date().getTime().toString();
  }

  uploadAvatarModal.value = false;
}

function inputCheckChangePasswordConfirm(value: string) {
  changePasswordConfirmInputStatus.value =
    value === changePasswordVal.value ? "success" : "error";
}

onBeforeMount(async () => {
  const result = await axios.get("/api/user").then((resp) => resp.data);

  if (result.code != 0) {
    message.error(result.msg);
    axios.get("/api/auth/logout");
    setTimeout(() => {
      location.reload();
    }, 3000);
    return;
  }

  const {
    username,
    nickname,
    avatarUrl,
    verified,
    streamServer,
    streamKey,
    liveroom,
  } = result.data;

  profileInfoValue.nickname = nickname;
  profileInfoValue.username = username;
  profileInfoValue.verified = verified;
  profileInfoValue.avatarUrl = avatarUrl;
  streamInfoValue.streamServer = streamServer;
  streamInfoValue.streamKey = streamKey;
  streamInfoValue.liveroom = liveroom;
});

async function updateStreamKey() {
  updateStreamKeyLoading.value = true;

  const result = await axios
    .get("/api/liveroom/get_key")
    .then((resp) => resp.data);

  updateStreamKeyLoading.value = false;

  if (result.code != 0) {
    message.error(result.msg);
    return;
  } else {
    message.success(result.msg);
  }

  const { key } = result.data;

  streamInfoValue.streamKey = key;
}

async function logout() {
  const result = await axios.get("/api/auth/logout").then((resp) => resp.data);

  if (result.code != 0) {
    message.error(result.msg);
    return;
  } else {
    message.success(result.msg);
  }

  emit("logout");
}

async function changePassword() {
  if (changePasswordConfirmVal.value != changePasswordVal.value) {
    message.error("二次密码不同");
    return;
  }

  const password = changePasswordVal.value;

  if (!password) {
    message.error("密码不能为空");
    return;
  }

  const result = await axios
    .post("/api/user/update", {
      password,
    })
    .then((resp) => resp.data);

  if (result.code != 0) {
    message.error(result.msg);
  } else {
    message.success(result.msg);
    changePasswordVal.value = "";
    changePasswordConfirmVal.value = "";
    changePasswordModal.value = false;
  }
}

function copy(type: "streamServer" | "streamKey" | "liveroom") {
  let value = "";

  switch (type) {
    case "streamServer":
      value = streamInfoValue.streamServer;
      break;

    case "streamKey":
      value = streamInfoValue.streamKey;
      break;

    case "liveroom":
      value = streamInfoValue.liveroom;
      break;

    default:
      return;
  }
  navigator.clipboard.writeText(value);
}
</script>
