<template>
  <el-container class="home_container">
    <div class="role-layout">
      <!-- 搜索区域 -->
      <el-form
        :model="searchForm"
        :rules="rules"
        ref="searchFormRef"
        :inline="true"
        class="search-form"
      >
        <el-form-item label="角色名称">
          <el-input v-model="searchForm.roleName" placeholder="请输入角色名称" />
        </el-form-item>
        <el-form-item label="角色状态">
          <el-select v-model="searchForm.status" placeholder="请选择角色状态">
            <el-option label="启用" value="enabled" />
            <el-option label="禁用" value="disabled" />
          </el-select>
        </el-form-item>
        <el-form-item label="开始时间">
          <el-date-picker
            v-model="searchForm.beginTime"
            placeholder="请输入开始时间"
            :picker-options="pickerOptions"
          />
        </el-form-item>
        <el-form-item label="结束时间">
          <el-date-picker
            v-model="searchForm.endTime"
            placeholder="请输入结束时间"
            :picker-options="pickerOptions"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="getroleList">
            <el-icon><Search /></el-icon>搜索
          </el-button>
          <el-button @click="resetSearch">
            <el-icon><Refresh /></el-icon>重置
          </el-button>
        </el-form-item>
      </el-form>

      <!-- 操作按钮区域 -->
      <div class="action-buttons">
        <el-button type="primary" @click="showAddDialog">
          <el-icon><Plus /></el-icon>新增
        </el-button>
        <el-button @click="toggleExpand">
          <el-icon><ArrowDown :class="{ 'rotate-180': isExpanded }" /></el-icon>
          {{ isExpanded ? "折叠" : "展开" }}
        </el-button>
      </div>

      <!-- 表格区域 -->
      <div class="table-container">
        <el-table :data="tableData" stripe row-key="id" style="width: 100%">
          <el-table-column prop="role_name" label="角色名称" min-width="180" />
          <el-table-column prop="role_key" label="角色标识" min-width="200" />
          <el-table-column prop="create_time" label="创建时间" width="180" />
          <el-table-column prop="status" label="角色状态" width="180">
            <template v-slot="scope">
              <el-switch
                v-model="scope.row.status"
                :active-color="'#13ce66'"
                :inactive-color="'#ff4949'"
                active-text="启用"
                inactive-text="禁用"
                :active-value="1"
                :inactive-value="2"
                @change="cstatuschange(scope.row.id, scope.row.status)"
              ></el-switch>
            </template>
          </el-table-column>
          <el-table-column prop="description" label="备注" min-width="200" />

          <el-table-column label="更多操作" width="150" fixed="right">
            <template #default="{ row }">
              <el-button link type="primary" size="small" @click="showupdateDialog(row)"
                >修改</el-button
              >
              <el-button
                @click="deleterole(row.id)"
                type="text"
                size="small"
                style="color: red"
                >删除</el-button
              >
              <el-button
                @click="showPermission(row.id)"
                type="text"
                size="small"
                style="color: grey"
                >分配权限</el-button
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

        <el-dialog v-model="permissionDialogVisible" title="分配权限" width="50%">
          <el-form :model="permissionform">
            <el-form-item label="选择菜单">
              <el-tree
                :data="treeData"
                show-checkbox
                node-key="id"
                :props="{
                  children: 'children',
                  label: 'menuName',
                }"
                :check-strictly="true"
                v-model="permissionform.menu_ids"
                @check-change="handleCheckChange"
              />
            </el-form-item>
          </el-form>

          <span slot="footer" class="dialog-footer">
            <el-button @click="permissionDialogVisible = false">取消</el-button>
            <el-button type="primary" @click="submitPermission">确定</el-button>
          </span>
        </el-dialog>

        <el-dialog
          v-model="addDialogVisible"
          title="新增角色"
          width="500px"
          :close-on-click-modal="false"
        >
          <el-form :model="addForm" label-width="100px" :rules="rules" ref="addFormRef">
            <el-tabs v-model="activeTab">
              <el-tab-pane label="角色类型" name="menuType"> </el-tab-pane>
            </el-tabs>
            <el-form-item
              label="角色名称"
              :rules="[{ required: true, message: '请输入角色名称', trigger: 'blur' }]"
            >
              <el-input
                v-model="addForm.role_name"
                placeholder="请输入角色名称"
              ></el-input>
            </el-form-item>

            <el-form-item label="角色标签">
              <el-input
                v-model="addForm.role_key"
                placeholder="请输入角色标签"
              ></el-input>
            </el-form-item>

            <el-form-item label="角色状态">
              <el-radio-group v-model="addForm.status">
                <el-radio :label="1">启用</el-radio>
                <el-radio :label="2">禁用</el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item label="角色描述">
              <el-select v-model="addForm.description" placeholder="请选择权限">
                <el-option label="全部权限" value="all"></el-option>
                <el-option label="部分权限" value="part"></el-option>
              </el-select>
            </el-form-item>
          </el-form>
          <template #footer>
            <span class="dialog-footer">
              <el-button @click="addDialogVisible = false">取消</el-button>
              <el-button type="primary" @click="submitAddForm">确定</el-button>
            </span>
          </template>
        </el-dialog>

        <el-dialog
          v-model="updateDialogVisible"
          title="修改角色"
          width="500px"
          :close-on-click-modal="false"
        >
          <el-form :model="addForm" label-width="100px" :rules="rules" ref="addFormRef">
            <el-tabs v-model="activeTab">
              <el-tab-pane label="角色类型" name="menuType"> </el-tab-pane>
            </el-tabs>
            <el-form-item
              label="角色名称"
              :rules="[{ required: true, message: '请输入角色名称', trigger: 'blur' }]"
            >
              <el-input
                v-model="addForm.role_name"
                placeholder="请输入角色名称"
              ></el-input>
            </el-form-item>

            <el-form-item label="角色标签">
              <el-input
                v-model="addForm.role_key"
                placeholder="请输入角色标签"
              ></el-input>
            </el-form-item>

            <el-form-item label="角色状态">
              <el-radio-group v-model="addForm.status">
                <el-radio :label="1">启用</el-radio>
                <el-radio :label="2">禁用</el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item label="角色描述">
              <el-select v-model="addForm.description" placeholder="请选择权限">
                <el-option label="全部权限" value="all"></el-option>
                <el-option label="部分权限" value="part"></el-option>
              </el-select>
            </el-form-item>
          </el-form>
          <template #footer>
            <span class="dialog-footer">
              <el-button @click="addDialogVisible = false">取消</el-button>
              <el-button type="primary" @click="submitUpdateForm">确定</el-button>
            </span>
          </template>
        </el-dialog>
      </div>
    </div>
  </el-container>
</template>

<script setup>
import { ref, onMounted, getCurrentInstance, computed, nextTick } from "vue";
import { Plus, Search, Refresh, ArrowDown } from "@element-plus/icons-vue";
import { ElMessage, ElMessageBox } from "element-plus";

const { proxy } = getCurrentInstance();
const tableRef = ref(null);
const addFormRef = ref(null);
const rolelist = ref([]);
const pageNum = ref(null); // 当前页数
const pageSize = ref(null); // 每页显示数量
const total = ref(null); // 总记录数

const isExpanded = ref(true);
const permissionDialogVisible = ref(false);
const addDialogVisible = ref(false);
const updateDialogVisible = ref(false);

const activeTab = ref("roleType");

const rules = {
  roleType: [{ required: true, message: "请选择角色类型" }],
  roleName: [{ required: true, message: "请输入角色名称" }],
};

const permissionform = ref({
  id: "",
  menu_ids: [],
});

const selectmenu = ref({});

const searchFormRef = ref();
const searchForm = ref({
  pageNum: "",
  pageSize: "",
  roleName: "",
  status: "",
  beginTime: "",
  endTime: "",
});

const addForm = ref({
  description: "string",
  role_key: "string",
  role_name: "string",
  status: 0,
});

const statuschange = ref({
  id: "",
  status: "",
});

const cstatuschange = (id, status) => {
  // 确保id和status被正确赋值
  statuschange.value.id = id;
  statuschange.value.status = status;

  // 调用API接口
  try {
    const params = {
      id: statuschange.value.id,
      status: statuschange.value.status,
    };

    const response = proxy.$api.roleupdatestatus(params); // 确保接口路径正确

    // 处理接口返回的结果
    if (response.success) {
    } else {
    }
  } catch (error) {}
};

const tableData = ref([]);

const res = ref([]);

const getMenuList = () => {
  proxy.$api
    .menulist()
    .then((response) => {
      // 修改 `res` 为 `response`，避免变量冲突
      res.value = response.data || []; // 确保 res.value 被赋值
      console.log("API 数据:", res.value);
    })
    .catch((err) => {
      ElMessage.error("获取菜单列表失败");
      console.error("获取菜单列表失败:", err);
    });
};

const treeData = computed(() => {
  if (!res.value.length) return [];

  const data = JSON.parse(JSON.stringify(res.value));
  const result = [];
  const map = {};

  data.forEach((item) => {
    map[item.id] = { ...item, children: [] }; // 复制对象，避免修改原始数据
  });

  data.forEach((item) => {
    const parent = map[item.parentId];
    if (parent) {
      parent.children.push(map[item.id]);
    } else {
      result.push(map[item.id]);
    }
  });
  console.log(treeData);
  return result;
});
// 提交权限
const submitPermission = () => {
  console.log(permissionform.value);
  proxy.$api.roleassignpermissions(permissionform.value).then((res) => {
    if (res.code === 200) {
      ElMessage.success("角色权限更新成功");
      permissionDialogVisible.value = false; // 关闭对话框
    } else {
      ElMessage.error("角色权限更新失败");
    }
  });
};

const getroleList = () => {
  proxy.$api
    .rolelist(searchForm.value)
    .then((res) => {
      tableData.value = res.data.list || [];
      pageNum.value = res.data.pageNum; // 更新当前页
      pageSize.value = res.data.pageSize; // 更新每页数量
      total.value = res.data.total; // 更新总记录数
    })
    .catch((err) => {
      ElMessage.error("获取角色列表失败");
      console.error("获取角色列表失败:", err);
    });
};

const submitAddForm = () => {
  addFormRef.value.validate((valid) => {
    if (!valid) {
      return ElMessage.error("请填写完整的表单数据");
    }
    console.log("请求数据:", addForm.value); // 打印请求数据
    proxy.$api
      .roleadd(addForm.value)
      .then((res) => {
        ElMessage.success("新增角色成功");
        addDialogVisible.value = false; // 关闭对话框
        getroleList(); // 重新加载角色列表
      })
      .catch((err) => {
        console.log("请求失败:", err);
        ElMessage.error("新增角色失败");
      });
  });
};

const submitUpdateForm = () => {
  addFormRef.value.validate((valid) => {
    if (!valid) {
      return ElMessage.error("请填写完整的表单数据");
    }
    console.log("请求数据:", addForm.value); // 打印请求数据
    const res = proxy.$api.roleupdate(addForm.value); // 调用角色更新接口

    // 处理接口返回的结果
    if (res.success) {
      ElMessage.success("修改角色成功"); // 显示成功消息
      addDialogVisible.value = false; // 关闭对话框
      getroleList(); // 重新加载角色列表
    } else {
      console.log("请求失败:", err);
      ElMessage.error("修改角色失败"); // 请求发生错误时显示错误消息
    }
  });
};

const resetSearch = () => {
  searchForm.value.roleName = "";
  searchForm.value.status = "";
  searchForm.value.beginTime = "";
  searchForm.value.endTime = "";
  getroleList();
};

// 勾选变化的处理函数
const handleCheckChange = (node, checked) => {
  if (checked) {
    permissionform.value.menu_ids.push(node.id);
  } else {
    const index = permissionform.value.menu_ids.indexOf(node.id);
    if (index !== -1) {
      permissionform.value.menu_ids.splice(index, 1);
    }
  }
};

// 显示权限分配对话框
const showPermission = (id) => {
  permissionform.value.id = id;
  permissionform.value.menu_ids = []; // 清空之前的菜单权限
  console.log("调用 showPermission，准备获取菜单数据");
  console.log("当前权限form数据:", permissionform.value);
  getMenuList(); // 调用获取菜单数据的方法
  getselect(id); // 调用获取菜单数据的方法

  nextTick(() => {
    console.log("treeData after update:", treeData);
    permissionDialogVisible.value = true; // 显示对话框
  });
};

const showAddDialog = () => {
  addDialogVisible.value = true;
};

// 获取菜单列表数据
const getselect = async (id) => {
  try {
    // 调用接口获取已分配的菜单
    const response = await proxy.$api.rolevoidlist({ id }); // 确保参数是对象

    console.log("接口返回的响应:", response);

    // 检查接口返回的 code 是否为 200
    if (response.code === 200) {
      // 如果接口返回的数据是有效的，直接赋值给 menu_ids
      permissionform.value.menu_ids = response.data; // response.data 是已选的菜单 ID 数组
    } else {
      ElMessage.error("获取菜单数据失败");
    }
  } catch (error) {
    // 捕获并打印错误信息
    console.error("获取菜单数据失败:", error);
    ElMessage.error("获取菜单数据失败");
  }
};

const showupdateDialog = (role) => {
  addForm.value = { ...role }; // 确保数据正确复制
  console.log("数据", addForm);
  updateDialogVisible.value = true;
};

onMounted(() => {
  getroleList();
  getMenuList(); // 获取菜单列表
});

const deleterole = (id) => {
  // 弹出确认框
  ElMessageBox.confirm("确定删除该角色吗？", "删除角色", {
    confirmButtonText: "删除",
    cancelButtonText: "取消",
    type: "warning",
  })
    .then(() => {
      // 用户确认删除，构造删除请求的结构体
      const deleteRequest = {
        id: id, // 这里传入你想要删除的角色ID
      };

      // 发送删除请求
      proxy.$api.roledelete(deleteRequest).then((res) => {
        if (res.code == 200) {
          ElMessage.success("角色删除成功");
          getroleList(); // 删除成功后重新加载角色列表
        } else {
          ElMessage.error("角色删除失败");
        }
      });
    })
    .catch(() => {
      // 用户取消删除
      ElMessage.info("删除操作已取消");
    });
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

.role-layout {
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

.role-table :deep(.el-table__row) {
  .el-button {
    font-size: 13px;
    margin: 0 4px;
  }
}

.role-table :deep(.el-table__expand-icon) {
  margin-right: 8px;
}

.role-table :deep(.el-tag) {
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
