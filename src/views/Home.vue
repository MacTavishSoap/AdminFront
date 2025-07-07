<template>
  <el-container class="home_container">
    <el-aside :width="isCollapse ? '64px' : '200px'">
      <div class="title">
        <h4 v-show="!isCollapse">题库管理后台</h4>
      </div>
      <el-menu
        background-color="#304156"
        text-color="#c1c1c1"
        unique-opened
        router
        :default-active="defaultActive"
      >
        <el-menu-item :index="'/welcome'" @click="saveNavState('/welcome')">
          <el-icon>
            <component is="HomeFilled"></component>
          </el-icon>
          <template #title>
            <span>首页</span>
          </template>
        </el-menu-item>

        <el-sub-menu :index="item.id + ''" v-for="item in leftMenuList" :key="item.id">
          <template #title>
            <el-icon>
              <component :is="item.icon"></component>
            </el-icon>
            <span>{{ item.menuName }}</span>
          </template>

          <el-menu-item
            :index="subItem.url"
            v-for="subItem in item.children"
            :key="subItem.id"
            @click="saveNavState(subItem.url)"
          >
            <template #title>
              <el-icon class="menu-item-icon">
                <component :is="subItem.icon"></component>
              </el-icon>
              <span class="menu-item-text">{{ subItem.menuName }}</span>
            </template>
          </el-menu-item>
        </el-sub-menu>
      </el-menu>
    </el-aside>

    <el-container>
      <el-header>
        <div class="fold-btn">
          <el-icon @click="toggleCollapse">
            <component :is="collapseBtnClass"></component>
          </el-icon>
        </div>

        <div class="bread-btn">
          <el-breadcrumb
            separator="/"
            v-if="router.currentRoute.value.path != '/welcome'"
          >
            <el-breadcrumb-item :to="{ path: '/welcome' }">
              <span style="font-weight: bold">首页</span>
            </el-breadcrumb-item>
            <el-breadcrumb-item>{{ route.meta.sTitle }}</el-breadcrumb-item>
            <el-breadcrumb-item>{{ route.meta.tTitle }}</el-breadcrumb-item>
          </el-breadcrumb>
        </div>
        
        <div class="user-info">
          <el-dropdown @command="handleCommand">
            <span class="el-dropdown-link">
              <el-icon><User /></el-icon>
              {{ sysAdmin.username || '管理员' }}
              <el-icon class="el-icon--right"><arrow-down /></el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="profile">个人信息</el-dropdown-item>
                <el-dropdown-item command="logout" divided>退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
        
      </el-header>
      <Tags />
      <el-main>
      
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import { useRouter, useRoute } from "vue-router";
import { useStore } from "vuex";
import Tags from "@/components/Tags.vue";
import { User, ArrowDown } from "@element-plus/icons-vue";
import { ElMessage, ElMessageBox } from "element-plus";

import { ref, reactive, getCurrentInstance, nextTick } from "vue";
const router = useRouter();
const store = useStore();
const route = useRoute();
const { proxy } = getCurrentInstance();
//菜单数据
const leftMenuList = proxy.$store.state.leftMenuList;
//用户信息
const sysAdmin = proxy.$store.state.sysAdmin;
console.log("菜单数据：", leftMenuList);
console.log("用户信息：", sysAdmin);

// 保持路由激活
const defaultActive = ref(router.currentRoute.value.path);
const saveNavState = (activePath) => {
  store.commit("saveActivePath", activePath);
};

//侧边栏展开
const isCollapse = ref(false);
const collapseBtnClass = ref("Expand");
const toggleCollapse = () => {
  isCollapse.value = !isCollapse.value;
  if (isCollapse.value) {
    collapseBtnClass.value = "Fold"; // 注意这里使用的是 collapseBtnClass
  } else {
    collapseBtnClass.value = "Expand";
  }
};

// 处理用户下拉菜单命令
const handleCommand = (command) => {
  if (command === 'logout') {
    handleLogout();
  } else if (command === 'profile') {
    // 可以跳转到个人信息页面
    ElMessage.info('个人信息功能待开发');
  }
};

// 登出功能
const handleLogout = () => {
  ElMessageBox.confirm(
    '确定要退出登录吗？',
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  ).then(() => {
    // 清除本地存储的用户信息
    store.commit('saveToken', '');
    store.commit('saveSysAdmin', '');
    store.commit('saveLeftMenuList', '');
    store.commit('savePermissionList', '');
    store.commit('saveActivePath', '');
    
    ElMessage.success('退出登录成功');
    // 跳转到登录页面
    router.push('/login');
  }).catch(() => {
    // 用户取消登出
  });
};


</script>

<style lang="scss" scoped>
.home_container {
  height: 100vh;
  .el-aside {
    background-color: #304156;
    .title {
      margin-top: 5px;
      display: flex;
      align-items: center; /* 垂直居中 */
      justify-content: center; /* 水平居中 */
      font-size: 13px;
      height: 50px;
      color: #fff;
    }
    .el-menu {
      border-right: none;
    }
  }
  .el-header {
    background-color: #f9fafc;
    align-items: center;
    justify-content: space-between;
    display: flex;

    .fold-btn {
      padding-top: 6px;
      font-size: 23px;
      cursor: pointer;
    }
    .bread-btn {
      position: fixed;
      margin-left: 40px;
    }
    .user-info {
      .el-dropdown-link {
        cursor: pointer;
        color: #606266;
        display: flex;
        align-items: center;
        font-size: 14px;
        
        &:hover {
          color: #409eff;
        }
        
        .el-icon {
          margin-right: 5px;
          
          &.el-icon--right {
            margin-left: 5px;
            margin-right: 0;
          }
        }
      }
    }
  }
  .el-main {
    background-color: #eaedf1;
  }
}
</style>
