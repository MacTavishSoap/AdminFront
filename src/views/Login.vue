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
import { ElMessage } from "element-plus";
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
  rememberme: false, // 记住密码选项
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
      
      // 保存登录信息到store
      store.commit('saveToken',res.data.token)
      store.commit('saveSysAdmin',res.data.sysAdmin)
      store.commit('saveLeftMenuList',res.data.leftMenuList)
      store.commit('savePermissionList',res.data.permissionList)
      
      // 处理记住密码功能
      if (formData.value.rememberme) {
        // 保存用户名和密码到localStorage
        localStorage.setItem('rememberedPhone', formData.value.phone);
        localStorage.setItem('rememberedPassword', formData.value.password);
        localStorage.setItem('rememberMe', 'true');
      } else {
        // 清除保存的用户名和密码
        localStorage.removeItem('rememberedPhone');
        localStorage.removeItem('rememberedPassword');
        localStorage.removeItem('rememberMe');
      }
      
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
    
    // 读取记住的用户信息
    const rememberMe = localStorage.getItem('rememberMe');
    if (rememberMe === 'true') {
      const rememberedPhone = localStorage.getItem('rememberedPhone');
      const rememberedPassword = localStorage.getItem('rememberedPassword');
      
      if (rememberedPhone && rememberedPassword) {
        formData.value.phone = rememberedPhone;
        formData.value.password = rememberedPassword;
        formData.value.rememberme = true;
      }
    }
    
    // 确保 formData 保持响应式（只重置验证码相关字段）
    if (!formData.value.phone && !formData.value.password) {
      Object.assign(formData.value, { phone: "", password: "", checkcode: "", idKey: "", rememberme: false });
    } else {
      Object.assign(formData.value, { checkcode: "", idKey: "" });
    }
  });
};

</script>

<style lang="scss" scoped>
.login-body {
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: url("../assets/bg.jpg") no-repeat center center/cover;
    opacity: 0.3;
    z-index: 1;
  }
  
  // 添加装饰性几何图形
  &::after {
    content: '';
    position: absolute;
    width: 200px;
    height: 200px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 50%;
    top: 10%;
    right: 10%;
    z-index: 1;
  }
}

.login-panel {
  width: 420px;
  margin: auto;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  padding: 40px 35px;
  border-radius: 20px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(255, 255, 255, 0.2);
  position: relative;
  z-index: 2;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 25px 50px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(255, 255, 255, 0.3);
  }

  .login-title {
    text-align: center;
    font-size: 28px;
    font-weight: 600;
    margin-bottom: 35px;
    color: #2c3e50;
    position: relative;
    
    &::after {
      content: '';
      position: absolute;
      bottom: -10px;
      left: 50%;
      transform: translateX(-50%);
      width: 60px;
      height: 3px;
      background: linear-gradient(135deg, #667eea, #764ba2);
      border-radius: 2px;
    }
  }
  
  // 表单项样式优化
  :deep(.el-form-item) {
    margin-bottom: 25px;
    
    .el-input {
      .el-input__wrapper {
        border-radius: 12px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        border: 1px solid #e1e8ed;
        transition: all 0.3s ease;
        
        &:hover {
          border-color: #667eea;
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.15);
        }
        
        &.is-focus {
          border-color: #667eea;
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.2);
        }
      }
      
      .el-input__inner {
        padding-left: 45px;
        font-size: 15px;
        color: #2c3e50;
        
        &::placeholder {
          color: #a0a8b0;
        }
      }
      
      .el-input__prefix {
        left: 15px;
        
        .iconfont {
          color: #667eea;
          font-size: 16px;
        }
      }
    }
  }
  
  // 按钮样式优化
  :deep(.op-btn) {
    width: 100%;
    height: 48px;
    border-radius: 12px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border: none;
    font-size: 16px;
    font-weight: 600;
    letter-spacing: 1px;
    transition: all 0.3s ease;
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(102, 126, 234, 0.3);
    }
    
    &:active {
      transform: translateY(0);
    }
  }
}

.check-code-panel {
  width: 100%;
  display: flex;
  gap: 10px;

  .check-code {
    width: 120px;
    height: 40px;
    border-radius: 8px;
    cursor: pointer;
    border: 1px solid #e1e8ed;
    transition: all 0.3s ease;
    
    &:hover {
      border-color: #667eea;
      box-shadow: 0 2px 8px rgba(102, 126, 234, 0.15);
    }
  }
  
  :deep(.el-input) {
    flex: 1;
  }
}

.rememberme-panel {
  width: 100%;
  
  :deep(.el-checkbox) {
    .el-checkbox__label {
      color: #5a6c7d;
      font-size: 14px;
    }
    
    .el-checkbox__input.is-checked .el-checkbox__inner {
      background-color: #667eea;
      border-color: #667eea;
    }
  }
}

// 响应式设计
@media (max-width: 480px) {
  .login-panel {
    width: 90%;
    padding: 30px 25px;
    margin: 20px;
  }
}
</style>
