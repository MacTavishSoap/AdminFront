<template>
  <div class="tags">
    <el-tag
      class="tag"
      size="large"
      closable
      v-for="(item, index) in tags"
      :key="item.path"
      :effect="item.title == route.meta.tTitle ? 'dark' : 'plain'"
      @click="goTo(item.path)"
      @close="close(index)"
      :disable-transitions="true"
      :closable="index > 0"
    >
      <i class="circular" v-show="item.title == route.meta.tTitle" />
      {{ item.title }}
    </el-tag>
  </div>
</template>

<script setup>
import { useRouter, useRoute } from "vue-router";
import { ref, watch } from "vue";
import { ElMessage } from "element-plus";
import {useStore} from 'vuex'
const store = useStore();

const router = useRouter();
const route = useRoute();

// 定义初始标签数组
const tags = ref([
  {
    title: "首页",
    path: "/welcome",
  },
]);

// 监听路由变化，当进入新页面时添加新的标签
watch(
  () => route.path, // 监听 path 变化，而不是整个 route 对象
  (newPath) => {
    const exists = tags.value.find((item) => item.path === newPath);
    if (!exists) {
      if (tags.value.length >= 18) {
        ElMessage.warning("标签数量不能大于18个");
        return;
      }
      tags.value.push({
        title: route.meta.tTitle || route.meta.title || "未知标题",
        path: newPath,
      });
    }
  },
  { immediate: true }
);

// 跳转到指定路径
const goTo = (path) => {
  router.push(path);
};

// 关闭标签
const close = (index) => {
  // 防止删除首页
  if (index === 0) return;

  // 当前被关闭的标签路径
  const closedTag = tags.value[index];

  // 如果当前被关闭的标签是当前路由，则导航到其他标签
  if (closedTag.path === route.path) {
    const nextIndex = index === tags.value.length - 1 ? index - 1 : index + 1;
    router.push(tags.value[nextIndex].path);
  }

  // 删除标签
  tags.value.splice(index, 1);
};


</script>

<style lang="scss" scoped>
.tags {
  padding-left: 20px;
  padding-top: 2px;
  padding-bottom: 2px;
  cursor: pointer;
  .tag {
    cursor: pointer;
    margin-right: 3px;
  }
  .circular {
    width: 8px;
    height: 8px;
    margin-right: 4px;
    background-color: #fff;
    border-radius: 50%;
    display: inline-block;
  }
}
</style>
