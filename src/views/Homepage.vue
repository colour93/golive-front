<template>
  <div class="homepage">
    <p class="title">Go Live</p>

    <div class="btn-group">
      <big-button id="login" type="primary" :onClick="showLogin"
        >登录</big-button
      >
      <big-button id="register" type="secondary" :onClick="showRegister"
        >注册</big-button
      >
    </div>
  </div>

  <n-modal v-model:show="loginModal">
    <n-card
      style="max-width: 330px"
      :bordered="true"
      role="dialog"
      aria-modal="true"
      class="modal"
    >
      <template #header><span class="modal-title"> 登录 </span></template>

      <div class="modal-content">
        <n-input
          v-model:value="loginUsernameVal"
          placeholder="用户名 / 邮箱"
          :input-props="{ type: 'username' }"
        >
          <template #prefix>
            <n-icon :component="Person" />
          </template>
        </n-input>

        <n-input
          v-model:value="loginPasswordVal"
          placeholder="密码"
          type="password"
        >
          <template #prefix>
            <n-icon :component="LockClosed" />
          </template>
        </n-input>
      </div>

      <template #footer
        ><n-button
          type="primary"
          class="modal-footer-btn"
          @click="login"
          :loading="loginLoading"
        >
          登录
        </n-button></template
      >
    </n-card>
  </n-modal>

  <n-modal v-model:show="registerModal">
    <n-card
      style="max-width: 330px"
      :bordered="true"
      role="dialog"
      aria-modal="true"
      class="modal"
    >
      <template #header><span class="modal-title"> 注册 </span></template>

      <div class="modal-content">
        <n-input
          v-model:value="registerUsernameVal"
          placeholder="用户名"
          :input-props="{ type: 'username' }"
          :status="registerUsernameInputStatus"
          :on-change="inputCheckUsername"
        >
          <template #prefix>
            <n-icon :component="Person" />
          </template>
        </n-input>

        <n-input
          v-model:value="registerNicknameVal"
          placeholder="昵称"
          :input-props="{ type: 'nickname' }"
          :status="registerNicknameInputStatus"
          :on-change="inputCheckNickname"
        >
          <template #prefix>
            <n-icon :component="PersonOutline" />
          </template>
        </n-input>

        <n-input
          v-model:value="registerEmailVal"
          placeholder="邮箱"
          type="email"
          :status="registerEmailInputStatus"
          :on-change="inputCheckEmail"
        >
          <template #prefix>
            <n-icon :component="Mail" />
          </template>
        </n-input>

        <n-input-group>
          <n-input v-model:value="registerOTPVal" placeholder="验证码">
            <template #prefix>
              <n-icon :component="EllipsisHorizontal" />
            </template>
          </n-input>
          <n-button
            type="primary"
            ghost
            @click="sendOTP"
            :disabled="new Boolean(sendOTPCooldown)"
            :loading="sendOTPLoading"
            :style="{ width: sendOTPCooldown ? '60px' : '140px' }"
          >
            {{ sendOTPCooldown || "发送验证码" }}
          </n-button>
        </n-input-group>

        <n-input
          v-model:value="registerPasswordVal"
          placeholder="密码"
          type="password"
        >
          <template #prefix>
            <n-icon :component="LockClosed" />
          </template>
        </n-input>

        <n-input
          v-model:value="registerConfirmPasswordVal"
          placeholder="确认密码"
          type="password"
          :status="registerConfirmPasswordInputStatus"
          :on-change="inputCheckConfirmPassword"
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
          @click="register"
          :loading="registerLoading"
        >
          注册
        </n-button></template
      >
    </n-card>
  </n-modal>
</template>

<style scoped>
p {
  margin: 0;
}

.title {
  position: absolute;
  top: 220px;
  left: 12.5vw;
  color: #fff;
  font-size: 64px;
  font-weight: 700;
}

.btn-group {
  position: absolute;
  bottom: 220px;
  width: 100%;
  display: flex;
  justify-content: space-between;
}

.btn-group > * {
  margin: 0 12.5vw;
}

@media (max-width: 768px) {
  .title {
    left: 50%;
    transform: translateX(-50%);
    text-align: center;
  }
  .btn-group {
    flex-direction: column;
    align-items: center;
  }

  .btn-group > * {
    margin: 10px 0px;
  }
}

@media (max-width: 425px) {
  .title {
    font-size: 52px;
  }
}

.homepage {
  height: 100vh;
  width: 100vw;
}

.homepage::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 40vw;
  height: 0;
  border-bottom: 100vh solid var(--indigo-a200);
  border-right: 20vw solid transparent;
  z-index: -1;
}

.modal-title {
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 24px;
}
</style>

<script setup lang="ts">
import BigButton from "../components/BigButton.vue";

import { useHead } from '@vueuse/head';
import { useMessage } from "naive-ui";
import axios from "axios";
import { ref } from "vue";

import {
  Person,
  PersonOutline,
  Mail,
  EllipsisHorizontal,
  LockClosed,
  LockClosedOutline,
} from "@vicons/ionicons5";

const emit = defineEmits(["login"]);

const loginModal = ref(false);
const registerModal = ref(false);

const registerUsernameInputStatus = ref("success");
const registerNicknameInputStatus = ref("success");
const registerEmailInputStatus = ref("success");
const registerConfirmPasswordInputStatus = ref("success");

const loginUsernameVal = ref("");
const loginPasswordVal = ref("");
const registerUsernameVal = ref("");
const registerNicknameVal = ref("");
const registerEmailVal = ref("");
const registerOTPVal = ref("");
const registerPasswordVal = ref("");
const registerConfirmPasswordVal = ref("");

const sendOTPLoading = ref(false);
const sendOTPCooldown = ref(0);

const loginLoading = ref(false);
const registerLoading = ref(false);

const message = useMessage();

useHead({
  title: "GoLive",
});

function showLogin() {
  loginModal.value = true;
}

function showRegister() {
  registerModal.value = true;
}

function checkEmail(email: string): boolean {
  return /[\w!#$%&'*+/=?^_`{|}~-]+(?:\.[\w!#$%&'*+/=?^_`{|}~-]+)*@(?:[\w](?:[\w-]*[\w])?\.)+[\w](?:[\w-]*[\w])?/.test(
    email
  );
}

function checkNickname(nickname: string): boolean {
  return !/\s/.test(nickname);
}

function checkUsername(username: string): boolean {
  return /^[a-zA-Z][a-zA-Z0-9_-]{2,16}$/.test(username);
}

function inputCheckUsername(value: string) {
  registerUsernameInputStatus.value = checkUsername(value)
    ? "success"
    : "error";
}

function inputCheckNickname(value: string) {
  registerNicknameInputStatus.value = checkNickname(value)
    ? "success"
    : "error";
}

function inputCheckEmail(value: string) {
  registerEmailInputStatus.value = checkEmail(value) ? "success" : "error";
}

function inputCheckConfirmPassword(value: string) {
  registerConfirmPasswordInputStatus.value =
    value === registerPasswordVal.value ? "success" : "error";
}

async function login() {
  const username = loginUsernameVal.value;
  const password = loginPasswordVal.value;

  if (!username || !password) {
    message.error("请将表单填写完整");
    return;
  }

  loginLoading.value = true;

  const result = await axios
    .post("/api/auth/login", {
      username,
      password,
    })
    .then((resp) => resp.data);

  loginLoading.value = false;

  if (result.code != 0) {
    message.error(result.msg);
    return;
  }

  message.success(result.msg);
  emit("login");
}

async function sendOTP() {
  const email = registerEmailVal.value;

  if (!email || !checkEmail(email)) {
    message.error("请输入正确的邮箱地址");
    return;
  }

  sendOTPLoading.value = true;

  const result = await axios
    .post("/api/auth/send_otp", {
      email,
    })
    .then((resp) => resp.data);

  sendOTPLoading.value = false;

  if (result.code != 0) {
    message.error(result.msg);
    return;
  }

  message.success(result.msg);

  sendOTPCooldown.value = 60;
  otpCooldown();
}

function otpCooldown() {
  if (sendOTPCooldown.value > 0) {
    setTimeout(() => {
      sendOTPCooldown.value--;
      otpCooldown();
    }, 1000);
  }
}

async function register() {
  const username = registerUsernameVal.value;
  const nickname = registerNicknameVal.value;
  const email = registerEmailVal.value;
  const otp = registerOTPVal.value;
  const password = registerPasswordVal.value;
  const confirmPassword = registerConfirmPasswordVal.value;

  if (
    !username ||
    !nickname ||
    !email ||
    !otp ||
    !password ||
    !confirmPassword
  ) {
    message.error("请将表单填写完整");
    return;
  }

  if (!checkUsername(username)) {
    registerUsernameInputStatus.value = "error";
    message.error(
      "用户名只应包含字母、数字、短横线与下划线，且至少 3 位至多 16 位"
    );
    return;
  }

  if (!checkNickname(nickname)) {
    registerNicknameInputStatus.value = "error";
    message.error("昵称中不应包含空格");
    return;
  }

  if (!checkEmail(email)) {
    registerEmailInputStatus.value = "error";
    message.error("邮箱格式不正确");
    return;
  }

  if (password != confirmPassword) {
    registerConfirmPasswordInputStatus.value = "error";
    message.error("确认密码不同");
    return;
  }

  registerUsernameInputStatus.value = "success";
  registerNicknameInputStatus.value = "success";
  registerEmailInputStatus.value = "success";
  registerConfirmPasswordInputStatus.value = "success";

  registerLoading.value = true;

  const result = await axios
    .post("/api/auth/register", {
      username,
      nickname,
      email,
      otp,
      password,
    })
    .then((resp) => resp.data);

  registerLoading.value = false;

  if (result.code != 0) {
    message.error(result.msg);
    return;
  }

  message.success(result.msg);
  emit("login");
}
</script>
