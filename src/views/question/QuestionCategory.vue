<template>
  <el-container class="home_container">
    <div class="category-layout">
      <!-- 搜索区域 -->
      <el-form
        :model="searchForm"
        :rules="rules"
        ref="searchFormRef"
        :inline="true"
        class="search-form"
      >
        <el-form-item label="种类名称">
          <el-input v-model="searchForm.category" placeholder="请输入种类名称" />
        </el-form-item>

        <el-form-item label="种类种类">
          <el-input v-model="searchForm.categoryType" placeholder="请选择类型" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="getcategoryList">
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
        <el-table
          ref="tableRef"
          :data="treeData"
          row-key="id"
          border
          :default-expand-all="isExpanded"
          :tree-props="{ children: 'children' }"
          class="menu-table"
        >
          <el-table-column prop="id" label="ID" width="180" />
          <el-table-column prop="category" label="种类名称" min-width="180">
            <template #default="{ row }">
              <span class="flex items-center">
                <el-icon v-if="row.icon" class="mr-2">
                  <component :is="row.icon" />
                </el-icon>
                {{ row.category }}
              </span>
            </template>
          </el-table-column>
          <el-table-column prop="categoryType" label="种类类型" width="100">
            <template #default="{ row }">
              <el-tag :type="row.categoryType === '按钮' ? 'danger' : ''" size="small">
                {{ row.categoryType }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="Status" label="种类状态" width="120">
            <template v-slot="scope">
              <el-switch
                v-model="scope.row.Status"
                :active-color="'#13ce66'"
                :inactive-color="'#ff4949'"
                active-text="启用"
                inactive-text="禁用"
                :active-value="1"
                :inactive-value="2"
                @change="cstatuschange(scope.row.id, scope.row.Status)"
              ></el-switch>
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
                v-if="checkPermission(leftcategorylist)"
                >修改</el-button
              >
              <el-button
                @click="deleteMenu(row.id)"
                type="text"
                size="small"
                style="color: red"
                v-if="checkPermission(leftcategorylist)"
                >删除</el-button
              >
            </template>
          </el-table-column>
        </el-table>


        <el-dialog
          v-model="addDialogVisible"
          title="新增种类"
          width="500px"
          :close-on-click-modal="false"
        >
          <el-form :model="addForm" label-width="100px" :rules="rules" ref="addFormRef">
            <el-tabs v-model="activeTab">
              <el-tab-pane label="种类类型" name="categoryType"> </el-tab-pane>
            </el-tabs>
            <el-form-item
              label="种类类型"
              :rules="[{ required: true, message: '请选择种类类型', trigger: 'blur' }]"
            >
              <el-radio-group v-model="addForm.categoryType">
                <el-radio-button :label="1">一级种类</el-radio-button>
                <el-radio-button :label="2">二级种类</el-radio-button>
                <el-radio-button :label="3">三级种类</el-radio-button>
              </el-radio-group>
            </el-form-item>

            <el-form-item label="上级种类">
              <el-select v-model="addForm.parentId" placeholder="请选择上级种类">
                <el-option
                  v-for="item in categorylist"
                  :key="item.id"
                  :label="`${item.category} (${item.id})`"
                  :value="item.id"
                ></el-option>
              </el-select>
            </el-form-item>

            <el-form-item
              label="种类名称"
              :rules="[{ required: true, message: '请输入种类名称', trigger: 'blur' }]"
            >
              <el-input
                v-model="addForm.category"
                placeholder="请输入种类名称"
              ></el-input>
            </el-form-item>

            <el-form-item label="排序">
              <el-input v-model="addForm.sort" placeholder="请输入排序" type="number" />
            </el-form-item>
            <el-form-item label="种类状态">
              <el-radio-group v-model="addForm.Status">
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

        <el-dialog
          v-model="updateDialogVisible"
          title="编辑种类"
          width="500px"
          :close-on-click-modal="false"
        >
          <el-form
            :model="updateForm"
            label-width="100px"
            :rules="rules"
            ref="updateFormRef"
          >
            <el-tabs v-model="activeTab">
              <el-tab-pane label="种类类型" name="categoryType"> </el-tab-pane>
            </el-tabs>

            <el-form-item
              label="种类类型"
              :rules="[{ required: true, message: '请选择种类类型', trigger: 'blur' }]"
            >
              <el-radio-group v-model="updateForm.categoryType">
                <el-radio-button :label="1">一级种类</el-radio-button>
                <el-radio-button :label="2">二级种类</el-radio-button>
                <el-radio-button :label="3">三级种类</el-radio-button>
              </el-radio-group>
            </el-form-item>

            <el-form-item label="上级种类">
              <el-select v-model="updateForm.parentId" placeholder="请选择上级种类">
                <el-option
                  v-for="item in categorylist"
                  :key="item.id"
                  :label="item.category"
                  :value="item.id"
                ></el-option>
              </el-select>
            </el-form-item>

            <el-form-item
              label="种类名称"
              :rules="[{ required: true, message: '请输入种类名称', trigger: 'blur' }]"
            >
              <el-input
                v-model="updateForm.category"
                placeholder="请输入种类名称"
              ></el-input>
            </el-form-item>

            <el-form-item label="排序">
              <el-input
                v-model="updateForm.sort"
                placeholder="请输入排序"
                type="number"
              />
            </el-form-item>

            <el-form-item label="种类状态">
              <el-radio-group v-model="updateForm.Status">
                <el-radio :label="1">启用</el-radio>
                <el-radio :label="2">禁用</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-form>

          <template #footer>
            <div class="dialog-footer">
              <el-button @click="updateDialogVisible = false">取消</el-button>
              <el-button type="primary" @click="submitUpdateForm">确定</el-button>
            </div>
          </template>
        </el-dialog>
      </div>
    </div>
  </el-container>
</template>

<script setup>
import { ref, onMounted, getCurrentInstance, computed } from "vue";
import { Plus, Search, Refresh, ArrowDown } from "@element-plus/icons-vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { useStore } from "vuex";

const store = useStore();

const { proxy } = getCurrentInstance();
const tableRef = ref([]);
const tableData = ref([]);

const addFormRef = ref(null);
const updateFormRef = ref(null);

const isExpanded = ref(true);

const addDialogVisible = ref(false);
const updateDialogVisible = ref(false);

const rules = {
  categoryName: [{ required: true, message: "请输入种类名称" }],
};
const searchFormRef = ref();
const searchForm = ref({
  pageNum: "",
  pageSize: 1000,
  category: "",
  category_type: "",
});

const updateForm = ref({
  category: "",
  categoryType: 1,
  Status: 1,
  sort: 0,
  categoryType: 0,
  parentId: 0,
});

const addForm = ref({
  category: "",
  categoryType: 1,
  Status: 1,
  sort: 0,
  categoryType: 0,
  parentId: 0,
});
const statuschange = ref({
  id: "",
  status: "",
});
const pageNum = ref(null); // 当前页数
const pageSize = ref(null); // 每页显示数量
const total = ref(null); // 总记录数

const categorylist = ref([]);
const getParentcategorylist = async () => {
  try {
    const res = await proxy.$api.questionvolist(); // 调用 API 获取菜单数据
    categorylist.value = res.data || [];
  } catch (error) {
    ElMessage.error("获取上级菜单失败");
    console.error("获取上级菜单失败:", error);
  }
};

const getcategoryList = () => {
  proxy.$api
    .categorylist(searchForm.value)
    .then((res) => {
      // 如果请求成功，设置数据
      tableData.value = res.data.list || [];
      pageNum.value = res.data.pageNum; // 更新当前页
      pageSize.value = res.data.pageSize; // 更新每页数量
      total.value = res.data.total; // 更新总记录数
      console.log(tableData.value);
    })
    .catch((err) => {
      // 处理请求失败的情况
      ElMessage.error("获取种类列表失败");
      console.error("获取种类列表失败:", err.response ? err.response.data : err);
    });
};
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
      .categoryadd(addForm.value)
      .then((res) => {
        if (res.code == 200) {
          ElMessage.success("种类增加成功");
          getcategoryList();
        } else {
          ElMessage.error("种类增加失败");
        }
      })
      .catch((err) => {
        console.log("请求失败:", err);
        ElMessage.error("新增种类失败");
      });
  });
};
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
    const response = proxy.$api.categoryupdatestatus(params); // 确保接口路径正确
    // 处理接口返回的结果
    if (response.success) {
    } else {
    }
  } catch (error) {}
};
const submitUpdateForm = (id) => {
  updateFormRef.value.validate((valid) => {
    if (!valid) {
      return ElMessage.error("请填写完整的表单数据");
    }
    console.log("请求数据:", updateForm.value); // 打印请求数据
    proxy.$api
      .categoryupdate(updateForm.value)
      .then((res) => {
        if (res.code == 200) {
          ElMessage.success("种类增加成功");
          getcategoryList();
        } else {
          ElMessage.error("种类增加失败");
        }
      })
      .catch((err) => {
        console.log("请求失败:", err);
        ElMessage.error("新增种类失败");
      });
  }); // 调用种类更新接口
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
const resetSearch = () => {
  searchForm.value.category = "";
  searchForm.value.category_type = "";
  searchForm.value.beginTime = "";
  searchForm.value.endTime = "";
  getcategoryList();
};

const showAddDialog = () => {
  getParentcategorylist();
  addDialogVisible.value = true;
};

const showupdateDialog = (row) => {
  updateForm.value = {
    id: row.id,
    category: row.category,
    Status: row.Status,
    sort: row.sort,
    categoryType: row.categoryType,
    parentId: row.parentId,
  };
  getParentcategorylist();
  updateDialogVisible.value = true; // 打开弹窗
};

onMounted(() => {
  getcategoryList();
});
const checkPermission = (treeData) => {
  // 防御：确保 treeData 是数组
  if (!Array.isArray(treeData)) return false;

  // 遍历每个节点
  for (const node of treeData) {
    // 如果当前节点有子节点，返回 true
    if (node.children?.length > 0) return false;
    // 递归检查子节点（确保传入的 children 是数组）
    if (checkPermission(node.children)) return false;
  }
  return true; // 整棵树都没有子节点
};
const deletecategory = (id) => {
  // 弹出确认框
  ElMessageBox.confirm("确定删除该种类吗？", "删除种类", {
    confirmButtonText: "删除",
    cancelButtonText: "取消",
    type: "warning",
  })
    .then(() => {
      // 用户确认删除，构造删除请求的结构体
      const deleteRequest = {
        id: id, // 这里传入你想要删除的种类ID
      };

      // 发送删除请求
      proxy.$api.categorydelete(deleteRequest).then((res) => {
        if (res.code == 200) {
          ElMessage.success("种类删除成功");
          getcategoryList(); // 删除成功后重新加载种类列表
        } else {
          ElMessage.error("种类删除失败");
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
  height: auto; 
}

.category-layout {
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
  flex: 1; /* 填充剩余空间 */
  overflow: auto; /* 内容超出时滚动 */
  max-height: 600px; /* 可选：限制最大高度 */
}

.category-table :deep(.el-table__row) {
  .el-button {
    font-size: 13px;
    margin: 0 4px;
  }
}

.category-table :deep(.el-table__expand-icon) {
  margin-right: 8px;
}

.category-table :deep(.el-tag) {
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
