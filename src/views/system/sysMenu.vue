<template>
  <el-container class="home_container">
    <div class="menu-layout">
      <!-- 搜索区域 -->
      <el-form
        :model="searchForm"
        :rules="rules"
        ref="searchFormRef"
        :inline="true"
        class="search-form"
      >
        <el-form-item label="菜单名称">
          <el-input v-model="searchForm.menuName" placeholder="请输入菜单名称" />
        </el-form-item>
        <el-form-item label="菜单状态">
          <el-select v-model="searchForm.menuStatus" placeholder="请选择菜单状态">
            <el-option label="启用" value="enabled" />
            <el-option label="禁用" value="disabled" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="getMenuList">
            <el-icon><Search /></el-icon>搜索
          </el-button>
          <el-button @click="resetSearch">
            <el-icon><Refresh /></el-icon>重置
          </el-button>
        </el-form-item>
      </el-form>

      <!-- 操作按钮区域 -->
      <div class="action-buttons">
        <el-button
          type="primary"
          @click="showAddDialog"
          v-if="checkPermission(leftMenuList, 'menu:add')"
        >
          <el-icon><Plus /></el-icon>新增
        </el-button>
        <el-button @click="toggleExpand">
          <el-icon><ArrowDown :class="{ 'rotate-180': isExpanded }" /></el-icon>
          {{ isExpanded ? "折叠" : "展开" }}
        </el-button>
      </div>

      <!-- 表格区域 -->
      <div class="table-container">
        <el-table
          ref="tableRef"
          :data="treeData"
          row-key="id"
          border
          :default-expand-all="isExpanded"
          :tree-props="{ children: 'children' }"
          class="menu-table"
        >
          <el-table-column prop="menuName" label="菜单名称" min-width="180">
            <template #default="{ row }">
              <span class="flex items-center">
                <el-icon v-if="row.icon" class="mr-2">
                  <component :is="row.icon" />
                </el-icon>
                {{ row.menuName }}
              </span>
            </template>
          </el-table-column>
          <el-table-column prop="value" label="权限值" width="120" align="center" />
          <el-table-column prop="icon" label="图标" width="120" align="center" />
          <el-table-column prop="url" label="菜单路径" min-width="200" />
          <el-table-column prop="menuType" label="菜单类型" width="100">
            <template #default="{ row }">
              <el-tag :type="row.menuType === '按钮' ? 'danger' : ''" size="small">
                {{ row.menuType }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="menuStatus" label="菜单状态" width="100">
            <template #default="{ row }">
              <el-tag
                :type="row.menuStatus === '启用' ? 'success' : 'danger'"
                size="small"
              >
                {{ row.menuStatus }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="sort" label="排序" width="80" align="center" />
          <el-table-column prop="createTime" label="创建时间" width="180" />
          <el-table-column label="更多操作" width="150" fixed="right">
            <template #default="{ row }">
              <el-button
                link
                type="primary"
                size="small"
                @click="showupdateDialog(row)"
                v-if="checkPermission(leftMenuList, 'menu:update')"
                >修改</el-button
              >
              <el-button
                @click="deleteMenu(row.id)"
                type="text"
                size="small"
                style="color: red"
                v-if="checkPermission(leftMenuList, 'menu:delete')"
                >删除</el-button
              >
            </template>
          </el-table-column>
        </el-table>
        <!-- 分页组件 -->
        <el-pagination
          :current-page="pageNum"
          :page-size="pageSize"
          :total="total"
          @current-change="handlePageChange"
          layout="total, prev, pager, next, jumper"
        ></el-pagination>
      </div>
    </div>

    <!-- 新增菜单对话框 -->
    <el-dialog
      v-model="addDialogVisible"
      title="新增菜单"
      width="500px"
      :close-on-click-modal="false"
    >
      <el-form :model="addForm" label-width="100px" :rules="rules" ref="addFormRef">
        <el-tabs v-model="activeTab">
          <el-tab-pane label="菜单类型" name="menuType"> </el-tab-pane>
        </el-tabs>
        <el-form-item
          label="菜单类型"
          :rules="[{ required: true, message: '请选择菜单类型', trigger: 'blur' }]"
        >
          <el-radio-group v-model="addForm.menuType">
            <el-radio-button :label="1">目录</el-radio-button>
            <el-radio-button :label="2">菜单</el-radio-button>
            <el-radio-button :label="3">按钮</el-radio-button>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="上级菜单">
          <el-select v-model="addForm.parentId" placeholder="请选择上级菜单">
            <el-option
              v-for="item in menulist"
              :key="item.id"
              :label="item.menuName"
              :value="item.id"
            ></el-option>
          </el-select>
        </el-form-item>

        <el-form-item label="菜单图标">
          <el-select v-model="addForm.icon" placeholder="请选择图标">
            <el-option label="设置" value="Setting"></el-option>
            <el-option label="用户" value="User"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item
          label="菜单名称"
          :rules="[{ required: true, message: '请输入菜单名称', trigger: 'blur' }]"
        >
          <el-input v-model="addForm.menuName" placeholder="请输入菜单名称"></el-input>
        </el-form-item>
        <el-form-item label="图标预览" v-if="addForm.icon">
          <el-icon :size="24"><component :is="addForm.icon" /></el-icon>
        </el-form-item>
        <el-form-item label="排序">
          <el-input v-model="addForm.sort" placeholder="请输入排序" type="number" />
        </el-form-item>
        <el-form-item label="权限值">
          <el-input v-model="addForm.value" placeholder="请输入权限值(用于按钮)" />
        </el-form-item>
        <el-form-item label="菜单状态">
          <el-radio-group v-model="addForm.menuStatus">
            <el-radio :label="1">启用</el-radio>
            <el-radio :label="2">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="addDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitAddForm">确定</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 修改菜单对话框 -->
    <el-dialog
      v-model="updateDialogVisible"
      title="修改菜单"
      width="500px"
      :close-on-click-modal="false"
    >
      <el-form :model="addForm" label-width="100px" :rules="rules" ref="addFormRef">
        <el-tabs v-model="activeTab">
          <el-tab-pane label="菜单类型" name="menuType"> </el-tab-pane>
        </el-tabs>
        <el-form-item
          label="菜单类型"
          :rules="[{ required: true, message: '请选择菜单类型', trigger: 'blur' }]"
        >
          <el-radio-group v-model="addForm.menuType">
            <el-radio-button :label="1">目录</el-radio-button>
            <el-radio-button :label="2">菜单</el-radio-button>
            <el-radio-button :label="3">按钮</el-radio-button>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="上级菜单">
          <el-select v-model="addForm.parentId" placeholder="请选择上级菜单">
            <el-option
              v-for="item in menulist"
              :key="item.id"
              :label="item.menuName"
              :value="item.id"
            ></el-option>
          </el-select>
        </el-form-item>

        <el-form-item label="菜单图标">
          <el-select v-model="addForm.icon" placeholder="请选择图标">
            <el-option label="设置" value="Setting"></el-option>
            <el-option label="用户" value="User"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item
          label="菜单名称"
          :rules="[{ required: true, message: '请输入菜单名称', trigger: 'blur' }]"
        >
          <el-input v-model="addForm.menuName" placeholder="请输入菜单名称"></el-input>
        </el-form-item>
        <el-form-item label="图标预览" v-if="addForm.icon">
          <el-icon :size="24"><component :is="addForm.icon" /></el-icon>
        </el-form-item>
        <el-form-item label="排序">
          <el-input v-model="addForm.sort" placeholder="请输入排序" type="number" />
        </el-form-item>
        <el-form-item label="权限值">
          <el-input v-model="addForm.value" placeholder="请输入权限值(用于按钮)" />
        </el-form-item>
        <el-form-item label="菜单状态">
          <el-radio-group v-model="addForm.menuStatus">
            <el-radio :label="1">启用</el-radio>
            <el-radio :label="2">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="addDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitUpdateForm">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </el-container>
</template>

<script setup>
import { ref, onMounted, getCurrentInstance, computed } from "vue";
import { Plus, Search, Refresh, ArrowDown, Setting, User } from "@element-plus/icons-vue";
import { ElMessage, ElMessageBox } from "element-plus";

const { proxy } = getCurrentInstance();
const tableRef = ref(null);
const addFormRef = ref(null);
const menulist = ref([]);
const pageNum = ref(null); // 当前页数
const pageSize = ref(null); // 每页显示数量
const total = ref(null); // 总记录数

const isExpanded = ref(true);
const addDialogVisible = ref(false);
const updateDialogVisible = ref(false);

const activeTab = ref("menuType");

const rules = {
  menuType: [{ required: true, message: "请选择菜单类型" }],
  menuName: [{ required: true, message: "请输入菜单名称" }],
};

const searchFormRef = ref();
const searchForm = ref({
  menuName: "",
  menuStatus: "",
});

const addForm = ref({
  icon: "", // 图标，前端传递的值
  menuName: "string", // 菜单名称
  menuStatus: 1, // 菜单状态，0表示启用，1表示禁用等
  menuType: 0, // 菜单类型，例如：0表示普通菜单，1表示子菜单等
  parentId: 0, // 父菜单ID，默认为0表示根菜单
  sort: 0, // 排序字段，数字越小排得越前
  url: "string", // 菜单对应的URL地址
  value: "string", // 权限值
});

const tableData = ref([]);

// 计算属性：将扁平数据转换为树形结构
const treeData = computed(() => {
  const data = JSON.parse(JSON.stringify(tableData.value));
  const result = [];
  const map = {};

  data.forEach((item) => {
    map[item.id] = item;
    item.children = [];
  });

  data.forEach((item) => {
    const parent = map[item.parentId];
    if (parent) {
      parent.children.push(item);
    } else {
      result.push(item);
    }
  });
  return result;
});

const submitAddForm = () => {
  addFormRef.value.validate((valid) => {
    if (!valid) {
      return ElMessage.error("请填写完整的表单数据");
    }
    console.log("请求数据:", addForm.value); // 打印请求数据
    proxy.$api
      .menuadd(addForm.value)
      .then((res) => {
        if (res.code === 200) {
          // 判断返回的状态码是否为200
          ElMessage.success("新增菜单成功");
          addDialogVisible.value = false; // 关闭对话框
          getMenuList(); // 重新加载菜单列表
        } else {
          ElMessage.error(res.message || "新增菜单失败"); // 返回非200状态码时显示失败提示
        }
      })
      .catch((err) => {
        console.log("请求失败:", err);
        ElMessage.error("新增菜单失败"); // 请求失败时显示失败提示
      });
  });
};

const submitUpdateForm = () => {
  addFormRef.value.validate((valid) => {
    if (!valid) {
      return ElMessage.error("请填写完整的表单数据");
    }
    console.log("请求数据:", addForm.value); // 打印请求数据
    proxy.$api
      .menuupdate(addForm.value) // 调用API接口进行更新
      .then((res) => {
        console.log("res ", res);
        if (res.code === 200) {
          // 判断返回的状态码是否为200
          ElMessage.success("修改菜单成功"); // 成功提示
          addDialogVisible.value = false; // 关闭对话框
          getMenuList(); // 重新加载菜单列表
        } else {
          ElMessage.error(res.message || "修改菜单失败"); // 返回非200状态码时显示失败提示
        }
      })
      .catch((err) => {
        console.log("请求失败:", err);
        ElMessage.error("修改菜单失败"); // 请求失败时显示失败提示
      });
  });
};

const getParentMenuList = async () => {
  try {
    const res = await proxy.$api.menulist(); // 调用 API 获取菜单数据
    menulist.value = res.data || []; // 把获取到的数据赋值给 menulist
  } catch (error) {
    ElMessage.error("获取上级菜单失败");
    console.error("获取上级菜单失败:", error);
  }
};

const getMenuList = () => {
  proxy.$api
    .menulist(searchForm.value)
    .then((res) => {
      tableData.value = res.data || [];
      pageNum.value = res.data.pageNum; // 更新当前页
      pageSize.value = res.data.pageSize; // 更新每页数量
      total.value = res.data.total; // 更新总记录数
    })
    .catch((err) => {
      ElMessage.error("获取菜单列表失败");
      console.error("获取菜单列表失败:", err);
    });
};

const resetSearch = () => {
  searchForm.value.menuName = "";
  searchForm.value.menuStatus = "";
  getMenuList();
};

const toggleExpand = () => {
  isExpanded.value = !isExpanded.value;
  const table = tableRef.value;
  if (table) {
    treeData.value.forEach((row) => {
      table.toggleRowExpansion(row, isExpanded.value);
    });
  }
};

const showAddDialog = () => {
  addDialogVisible.value = true;
};

const showupdateDialog = (menu) => {
  addForm.value = { ...menu }; // 确保数据正确复制
  console.log("数据", addForm);
  updateDialogVisible.value = true;
};

onMounted(() => {
  getMenuList();
  getParentMenuList(); // 获取上级菜单
});

// 添加删除功能
const deleteMenu = (id) => {
  // 弹出确认框
  ElMessageBox.confirm("确定删除该菜单吗？", "删除菜单", {
    confirmButtonText: "删除",
    cancelButtonText: "取消",
    type: "warning",
  })
    .then(() => {
      // 用户确认删除
      proxy.$api.menudelete(id).then((res) => {
        if (res.code == 200) {
          ElMessage.success("菜单删除成功");
          getMenuList(); // 删除成功后重新加载菜单列表
        } else {
          ElMessage.error("菜单删除失败");
        }
      });
    })
    .catch(() => {
      // 用户取消删除
      ElMessage.info("删除操作已取消");
    });
};

const leftMenuList = proxy.$store.state.leftMenuList;
const checkPermission = (leftMenuList, permission) => {
  for (const menu of leftMenuList) {
    // 检查当前菜单是否匹配权限标识符
    if (menu.value === permission) {
      return true; // 找到匹配的权限，返回 true
    }
    // 如果菜单有子菜单，递归检查子菜单
    if (menu.children && menu.children.length > 0) {
      if (checkPermission(menu.children, permission)) {
        return true;
      }
    }
  }
  return false; // 没有找到匹配的权限
};
</script>

<style scoped>
/* 保持原有的样式不变 */
.home_container {
  padding: 30px;
  background-color: #fff;
  border-radius: 10px;
  min-height: calc(100vh - 60px);
}

.menu-layout {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.search-form {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 20px;
  padding: 20px;
  background-color: #f8f9fa;
  border-radius: 8px;
}

.search-form :deep(.el-form-item) {
  margin: 0;
}

.search-form :deep(.el-form-item__label) {
  font-weight: 500;
}

.search-form :deep(.el-input),
.search-form :deep(.el-select) {
  width: 240px;
}

.action-buttons {
  display: flex;
  gap: 12px;
  padding: 0 20px;
}

.table-container {
  padding: 0 20px;
}

.menu-table :deep(.el-table__row) {
  .el-button {
    font-size: 13px;
    margin: 0 4px;
  }
}

.menu-table :deep(.el-table__expand-icon) {
  margin-right: 8px;
}

.menu-table :deep(.el-tag) {
  border-radius: 2px;
  padding: 0 8px;
}

:deep(.el-button--small) {
  padding: 8px 12px;
}

:deep(.el-icon) {
  vertical-align: middle;
}

.rotate-180 {
  transform: rotate(180deg);
  transition: transform 0.3s ease;
}

/* 新增对话框样式 */
.el-dialog :deep(.el-tabs__header) {
  margin-bottom: 20px;
}

.el-dialog :deep(.el-radio-button__inner) {
  padding: 8px 20px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}
</style>
