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
        <el-table :data="tableData" stripe row-key="id" style="width: 100%">
          <el-table-column prop="id" label="ID" min-width="200" />
          <el-table-column prop="category" label="种类名称" min-width="180" />
          <el-table-column prop="createTime" label="创建时间" width="180" />
          <el-table-column prop="createdBy" label="创建人" width="180" />
          <el-table-column prop="categoryType" label="种类级别" width="180" />
          <el-table-column label="更多操作" width="150" fixed="right">
            <template #default="{ row }">
              <el-button link type="primary" size="small" @click="showupdateDialog(row)"
                >修改</el-button
              >
              <el-button
                @click="deletecategory(row.id)"
                type="text"
                size="small"
                style="color: red"
                >删除</el-button
              >
            </template>
          </el-table-column>
        </el-table>
        <el-pagination
          :current-page="pageNum"
          :page-size="pageSize"
          :total="total"
          @current-change="handlePageChange"
          layout="total, prev, pager, next, jumper"
        ></el-pagination>
        <el-dialog
          v-model="addDialogVisible"
          title="添加种类"
          width="80%"
          :close-on-click-modal="false"
          class="category-editor"
        >
          <el-form :model="addForm" ref="addFormRef" label-width="80px">
            <el-form-item label="种类名称">
              <el-input v-model="addForm.category" placeholder="请输入种类名称" />
            </el-form-item>
            <el-form-item label="权限值">
              <el-input
                v-model="addForm.categoryType"
                placeholder="请输入权限值(用于按钮)"
              />
            </el-form-item>
          </el-form>

          <template #footer>
            <div class="dialog-footer">
              <el-button @click="addDialogVisible = false">取消</el-button>
              <el-button type="primary" @click="submitAddForm">确定</el-button>
            </div>
          </template>
        </el-dialog>

        <el-dialog
          v-model="updateDialogVisible"
          title="编辑种类"
          width="80%"
          :close-on-click-modal="false"
          class="category-editor"
        >
          <el-form :model="updateForm" ref="updateFormRef" label-width="80px"> </el-form>

          <template #footer>
            <div class="dialog-footer">
              <el-button @click="updateDialogVisible = false">取消</el-button>
              <el-button type="primary" @click="submitUpdateForm">确定</el-button>
            </div>
          </template>
        </el-dialog>
      </div>
    </div>

    <el-dialog v-model="pwDialogVisible" title="修改种类密码" width="30%">
      <el-form :model="passwordform">
        <el-form-item
          label="新密码"
          prop="password"
          :rules="[{ required: true, message: '请输入密码', trigger: 'blur' }]"
        >
          <el-input
            v-model="passwordform.password"
            type="password"
            placeholder="请输入新密码"
          ></el-input>
        </el-form-item>
      </el-form>

      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitPassword">提交</el-button>
      </span>
    </el-dialog>
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
  pageSize: "",
  category: "",
  category_type: "",
});

const updateForm = ref({
  category: "",
  categoryType: 0,
  parentId: 0,
});

const addForm = ref({
  category: "",
  categoryType: 0,
  parentId: 0,
});
const pageNum = ref(null); // 当前页数
const pageSize = ref(null); // 每页显示数量
const total = ref(null); // 总记录数

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

const resetSearch = () => {
  searchForm.value.username = "";
  searchForm.value.status = "";
  searchForm.value.beginTime = "";
  searchForm.value.endTime = "";
  getcategoryList();
};

const showAddDialog = () => {
  addDialogVisible.value = true;
};

const showupdateDialog = (row) => {
  updateForm.value = {
    id: row.id,
  };
  updateDialogVisible.value = true; // 打开弹窗
};

onMounted(() => {
  getcategoryList();
});

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
// 页码变化时触发的处理函数
const handlePageChange = (newPage) => {
  searchForm.value.pageNum = newPage
getcategoryList();
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
  padding: 0 20px;
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
