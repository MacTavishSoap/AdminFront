<template>
  <el-container class="home_container">
    <div class="user-layout">
      <!-- 搜索区域 -->
      <el-form
        :model="searchForm"
        :rules="rules"
        ref="searchFormRef"
        :inline="true"
        class="search-form"
      >
        <el-form-item label="用户名称">
          <el-input v-model="searchForm.userName" placeholder="请输入用户名称" />
        </el-form-item>
        <el-form-item label="用户状态">
          <el-select v-model="searchForm.status" placeholder="请选择用户状态">
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
          <el-button type="primary" @click="getuserList">
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
          <el-table-column prop="id" label="ID" min-width="180" />
          <el-table-column prop="openid" label="openid" min-width="180" />
          <el-table-column prop="nickname" label="用户昵称" min-width="180" />

<el-table-column prop="roles" label="状态" width="180">
  <template #default="scope">
    <el-select 
      v-model="scope.row.roles" 
      placeholder="请选择权限" 
      @change="(value) => handleRoleChange(scope.row.id, value)">
      <el-option
        v-for="role in roleList"
        :key="role.id"
        :label="role.role_name"
        :value="role.user_key"
      ></el-option>
    </el-select>
  </template>
</el-table-column>

          <el-table-column prop="phone" label="电话号码" min-width="200" />
          <el-table-column prop="roles" label="角色" width="180" />
          <el-table-column prop="major" label="备注（专业）" width="180" />
          <el-table-column prop="total_time" label="总刷题时间" width="180" />
          <el-table-column prop="total_questions" label="总刷题数" width="180" />
          <el-table-column prop="invite_code" label="邀请码" width="180" />
          <el-table-column prop="created_at" label="创建时间" width="180" />
          <el-table-column prop="status" label="状态" width="180">
            <template #default="scope">
              <el-switch
                v-model="scope.row.status"
                :active-color="'#13ce66'"
                :inactive-color="'#ff4949'"
                active-text="启用"
                inactive-text="禁用"
                :active-value="1"
                :inactive-value="2"
                @change="cstatuschange(scope.row.id, scope.row.status)"
              />
            </template>
          </el-table-column>
          <el-table-column prop="last_login_ip" label="上次登录ip" width="180" />
        </el-table>

        <!-- 分页组件 -->
        <el-pagination
          :current-page="pageNum"
          :page-size="pageSize"
          :total="total"
          @current-change="handlePageChange"
          layout="total, prev, pager, next, jumper"
        ></el-pagination>
        <el-dialog
          v-model="addDialogVisible"
          title="新增用户"
          width="500px"
          :close-on-click-modal="false"
        >
          <el-form :model="addForm" label-width="100px" :rules="rules" ref="addFormRef">
            <el-tabs v-model="activeTab">
              <el-tab-pane label="用户类型" name="menuType"> </el-tab-pane>
            </el-tabs>
            <el-form-item
              label="用户名称"
              :rules="[{ required: true, message: '请输入用户名称', trigger: 'blur' }]"
            >
              <el-input
                v-model="addForm.username"
                placeholder="请输入用户名称"
              ></el-input>
            </el-form-item>

            <el-form-item label="用户标签">
              <el-select v-model="addForm.roleId" placeholder="请选择权限">
                <el-option
                  v-for="role in roleList"
                  :key="role.id"
                  :label="role.role_name"
                  :value="role.id"
                ></el-option>
              </el-select>
            </el-form-item>
            <el-form-item
              label="手机号"
              :rules="[{ required: true, message: '请输入手机号', trigger: 'blur' }]"
            >
              <el-input v-model="addForm.phone" placeholder="请输入手机号"></el-input>
            </el-form-item>
            <el-form-item
              label="用户密码"
              :rules="[{ required: true, message: '请输入密码', trigger: 'blur' }]"
            >
              <el-input
                v-model="addForm.password"
                placeholder="请输入用户密码"
              ></el-input>
            </el-form-item>

            <el-form-item label="用户状态">
              <el-radio-group v-model="addForm.status">
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
          title="修改用户"
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
              <el-tab-pane label="用户类型" name="menuType"> </el-tab-pane>
            </el-tabs>
            <el-form-item
              label="用户名称"
              :rules="[{ required: true, message: '请输入用户名称', trigger: 'blur' }]"
            >
              <el-input
                v-model="updateForm.username"
                placeholder="请输入用户名称"
              ></el-input>
            </el-form-item>
            <el-form-item label="用户标签">
              <el-select v-model="updateForm.roleId" placeholder="请选择权限">
                <el-option
                  v-for="role in roleList"
                  :key="role.id"
                  :label="role.role_name"
                  :value="role.id"
                ></el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="用户描述">
              <el-input v-model="updateForm.note" placeholder="请输入用户描述"></el-input>
            </el-form-item>

            <el-form-item label="用户状态">
              <el-radio-group v-model="updateForm.status">
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
      </div>
    </div>

    <el-dialog v-model="pwDialogVisible" title="修改用户密码" width="30%">
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

const { proxy } = getCurrentInstance();
const tableRef = ref([]);
const tableData = ref([]);
const addFormRef = ref(null);
const updateFormRef = ref(null);
const userlist = ref([]);
const pageNum = ref(null); // 当前页数
const pageSize = ref(null); // 每页显示数量
const total = ref(null); // 总记录数

const isExpanded = ref(true);
const permissionDialogVisible = ref(false);
const addDialogVisible = ref(false);
const updateDialogVisible = ref(false);

const activeTab = ref("userType");

const rules = {
  userName: [{ required: true, message: "请输入用户名称" }],
};

const passwordform = ref({
  id: "",
  password: "",
});
const searchFormRef = ref();
const searchForm = ref({
  pageNum: "",
  pageSize: "",
  username: "",
  status: "",
  beginTime: "",
  endTime: "",
});

const updateForm = ref({
  id: "",
  note: "",
  phone: "",
  roleId: "",
  status: "",
  username: "",
});

const addForm = ref({
  password: "",
  phone: "",
  roleId: "",
  username: "",
  status: 1,
});

const statuschange = ref({
  id: "",
  status: "",
});
const rolechange = ref({
  id: "",
  roles: "",
});

const handleRoleChange = (id, role) => {
  // 确保id和status被正确赋值
  rolechange.value.id = id;
  rolechange.value.roles = role;

  // 调用API接口
  try {
    const params = {
      id: rolechange.value.id,
      roles: rolechange.value.roles,
    };

    const response = proxy.$api.userroleup(params); // 确保接口路径正确

    // 处理接口返回的结果
    if (response.success) {
      ElMessage.success("权限修改成功");
      getuserList();
    } else {
    }
  } catch (error) {}
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

    const response = proxy.$api.userupdatestatus(params); // 确保接口路径正确

    // 处理接口返回的结果
    if (response.success) {
      ElMessage.success("权限修改成功");
      getuserList();
    } else {
    }
  } catch (error) {}
};

const getuserList = () => {
  proxy.$api
    .userlist(searchForm.value)
    .then((res) => {
      tableData.value = res.data.list || [];
      pageNum.value = res.data.pageNum; // 更新当前页
      pageSize.value = res.data.pageSize; // 更新每页数量
      total.value = res.data.total; // 更新总记录数
      console.log(tableData.value);
    })
    .catch((err) => {
      ElMessage.error("获取用户列表失败");
      console.error("获取用户列表失败:", err);
    });
};

const submitAddForm = () => {
  addFormRef.value.validate((valid) => {
    if (!valid) {
      return ElMessage.error("请填写完整的表单数据");
    }
    console.log("请求数据:", addForm.value); // 打印请求数据
    proxy.$api
      .useradd(addForm.value)
      .then((res) => {
        if (res.code == 200) {
          ElMessage.success("用户增加成功");
          getuserList();
        } else {
          ElMessage.error("用户增加失败");
        }
      })
      .catch((err) => {
        console.log("请求失败:", err);
        ElMessage.error("新增用户失败");
      });
  });
};

const submitUpdateForm = () => {
  updateFormRef.value.validate((valid) => {
    if (!valid) {
      return ElMessage.error("请填写完整的表单数据");
    }
    console.log("请求数据:", updateForm.value); // 打印请求数据
    const res = proxy.$api.userupdate(updateForm.value); // 调用用户更新接口

    // 处理接口返回的结果
    if (res.res.code == 200) {
      ElMessage.success("修改用户成功"); // 显示成功消息
      addDialogVisible.value = false; // 关闭对话框
      getuserList(); // 重新加载用户列表
    } else {
      ElMessage.error("修改用户失败"); // 请求发生错误时显示错误消息
    }
  });
};

const resetSearch = () => {
  searchForm.value.username = "";
  searchForm.value.status = "";
  searchForm.value.beginTime = "";
  searchForm.value.endTime = "";
  getuserList();
};

const roleList = ref([]);

// 获取角色列表
const getRoleList = () => {
  proxy.$api
    .userrolevolist()
    .then((res) => {
      if (res.code === 200) {
        roleList.value = res.data;
      } else {
        ElMessage.error("获取角色列表失败");
      }
    })
    .catch((err) => {
      console.error("获取角色列表失败:", err);
    });
};

const showAddDialog = () => {
  addDialogVisible.value = true;
};

onMounted(() => {
  getuserList();
  getRoleList();
});


// 页码变化时触发的处理函数
const handlePageChange = (newPage) => {
  searchForm.value.pageNum = newPage;
  getuserList();
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
  flex:1;
}

.user-layout {
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

.user-table :deep(.el-table__row) {
  .el-button {
    font-size: 13px;
    margin: 0 4px;
  }
}

.user-table :deep(.el-table__expand-icon) {
  margin-right: 8px;
}

.user-table :deep(.el-tag) {
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
