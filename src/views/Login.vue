<template>
  <div class="login-body">
    <div class="login-panel">
      <div class="login-title">登录后台</div>
      <el-form :model="formData" :rules="rules" ref="formDataRef">
        <el-form-item prop="phone">
          <el-input size="large" clearable placeholder="请输入手机号" v-model="formData.phone">
            <template #prefix>
              <span class="iconfont icon-icon-test24"></span>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item prop="password">
          <el-input showpassword type="password" size="large" clearable placeholder="请输入密码" v-model="formData.password">
            <template #prefix>
              <span class="iconfont icon-icon-test26"></span>
            </template>
          </el-input>
        </el-form-item>

        <el-form-item prop="checkcode">
          <div class="check-code-panel">
            <el-input size="large" clearable placeholder="请输入验证码" v-model="formData.checkcode">
              <template #prefix>
                <span class="iconfont icon-icon-test47"></span>
              </template>
            </el-input>

            <img :src="checkCodeUrl" class="check-code" @click="changeCheckCode" />
          </div>
        </el-form-item>

        <el-form-item>
          <div class="rememberme-panel">
            <el-checkbox v-model="formData.rememberme">记住我</el-checkbox>
          </div>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" class="op-btn" @click="doSubmit" size="large">登录</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script setup>
import { useStore } from 'vuex'
import { ref, reactive, getCurrentInstance, nextTick, onMounted } from "vue";
import { useRouter } from "vue-router"; // 导入 useRouter
import md5 from "js-md5";

const { proxy } = getCurrentInstance();

// 表单数据和验证规则
const rules = {
  phone: [{ required: true, message: "请输入手机号" }],
  password: [{ required: true, message: "请输入密码" }],
  checkcode: [{ required: true, message: "请输入图片验证码" }],
};

const api = {
  checkCode: "/api/checkCode",
  login: "/api/login",
};

const router = useRouter(); // 使用 useRouter 获取路由实例
const store = useStore();
const formDataRef = ref();
const formData = ref({
  phone: '',
  password: '',
  checkcode: '', // 统一使用 checkcode
  idKey: '',
});

// 登录操作
const doSubmit = () => {
  formDataRef.value.validate(valid => {
    if (!valid) {
      return ElMessage.error("请填写完整的表单数据");
    }
    console.log("请求数据:", formData.value); // 打印请求数据
    proxy.$api.login(formData.value).then(res => {
      console.log("登录的数据", res);
      store.commit('saveToken',res.data.token)
      store.commit('saveSysAdmin',res.data.sysAdmin)
      store.commit('saveLeftMenuList',res.data.leftMenuList)
      store.commit('savePermissionList',res.data.permissionList)
      router.push('/home')
    }).catch(err => {
      console.log("请求失败:", err);
    });
  });
};

// 验证码 URL 和刷新操作
const checkCodeUrl = ref("");
const changeCheckCode = ()=> {
  proxy.$api.captcha().then(res => {
    checkCodeUrl.value = res.data.image
    formData.value.idKey = res.data.idKey
    console.log("验证码：",res.data)
  }).catch(error => {
    console.log(error)
  })
}
onMounted(() => {
  init();
});

const init = () => {
  nextTick(() => {
    changeCheckCode();
    if (formDataRef.value) {
      formDataRef.value.resetFields();
    }
    // 确保 formData 保持响应式
    Object.assign(formData.value, { phone: "", password: "", checkcode: "", idKey: "" });
  });
};

</script>

<style lang="scss" scoped>
.login-body {
  height: 100vh;
  display: flex;
  background: url("../assets/bg.jpg") no-repeat center center/cover;
}

.login-panel {
  width: 400px;
  margin: auto;
  background-color: rgba(255, 255, 255, 0.8);
  padding: 20px;
  border-radius: 10px;

  .login-title {
    text-align: center;
    font-size: 24px;
    margin-bottom: 20px;
  }
}

.check-code-panel {
  width: 100%;
  display: flex;

  .check-code {
    margin-left: 5px;
    cursor: pointer;
  }
}

.rememberme-panel {
  width: 100%;
}
</style>
