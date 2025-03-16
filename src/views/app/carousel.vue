<template>
  <el-container class="home_container">
    <div class="question-layout">
      <!-- 搜索区域 -->
      <el-form :model="searchForm" :rules="rules" ref="searchFormRef" :inline="true" class="search-form">
        <el-form-item label="轮播图名称">
          <el-input v-model="searchForm.content" placeholder="请输入轮播图名称" />
        </el-form-item>

        <el-form-item label="轮播图种类">
          <el-select v-model="searchForm.categoryid" placeholder="请选择类型">
            <el-option v-for="cate in categoryData" :key="cate.id" :label="cate.category" :value="cate.id"></el-option>
          </el-select>
        </el-form-item>

        <el-form-item label="难度">
          <el-select v-model="searchForm.difficulty" placeholder="请选择难度">
            <el-option label="1" value="1" />
            <el-option label="2" value="2" />
            <el-option label="3" value="3" />
            <el-option label="4" value="4" />
            <el-option label="5" value="5" />
          </el-select>
        </el-form-item>

        <el-form-item label="轮播图类型">
          <el-select v-model="searchForm.type" placeholder="请选择类型">
            <el-option label="启用" value="enabled" />
            <el-option label="禁用" value="disabled" />
          </el-select>
        </el-form-item>

        <el-form-item label="轮播图状态">
          <el-select v-model="searchForm.status" placeholder="请选择轮播图状态">
            <el-option label="启用" value="enabled" />
            <el-option label="禁用" value="disabled" />
          </el-select>
        </el-form-item>

        <el-form-item label="创建人">
          <el-input v-model="searchForm.createBy" placeholder="请输入创建人" />
        </el-form-item>

        <el-form-item label="开始时间">
          <el-date-picker v-model="searchForm.beginTime" placeholder="请输入开始时间" :picker-options="pickerOptions" />
        </el-form-item>
        <el-form-item label="结束时间">
          <el-date-picker v-model="searchForm.endTime" placeholder="请输入结束时间" :picker-options="pickerOptions" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="getquestionList">
            <el-icon>
              <Search />
            </el-icon>搜索
          </el-button>
          <el-button @click="resetSearch">
            <el-icon>
              <Refresh />
            </el-icon>重置
          </el-button>
        </el-form-item>
      </el-form>

      <!-- 操作按钮区域 -->
      <div class="action-buttons">
        <el-button type="primary" @click="showAddDialog">
          <el-icon>
            <Plus />
          </el-icon>新增
        </el-button>
        <el-button @click="toggleExpand">
          <el-icon>
            <ArrowDown :class="{ 'rotate-180': isExpanded }" />
          </el-icon>
          {{ isExpanded ? "折叠" : "展开" }}
        </el-button>
      </div>

      <!-- 上传组件 -->
      <el-dialog title="上传轮播图文件" v-model="uploadVisible" width="30%">
        <el-upload class="upload-demo" drag :before-upload="beforeUpload" :on-success="handleUploadSuccess"
          :on-error="handleUploadError" :show-file-list="true" :http-request="confirmUpload" action=" ">
          <i class="el-icon-upload"></i>
          <div class="el-upload__text">点击或拖动文件上传</div>
          <div class="el-upload__tip" slot="tip">支持 txt 文件</div>
        </el-upload>
        <span slot="footer" class="dialog-footer">
          <el-button @click="uploadVisible = false">取消</el-button>
        </span>
      </el-dialog>

      <!-- 解析后的文件数据预览 -->
      <el-dialog title="文件解析结果" v-model="previewVisible" width="50%">
        <el-form :model="addForm" ref="addFormRef" label-width="80px">
          <el-form-item label="分类" required>
            <el-select v-model="addForm.categoryId" placeholder="请选择分类" class="w-full">
              <el-option v-for="cate in categoryData" :key="cate.id" :label="cate.category"
                :value="cate.id"></el-option>
            </el-select>
          </el-form-item>
          <el-table :data="parsedQuestions" style="width: 100%">
            <el-table-column prop="content" label="轮播图内容" width="200"></el-table-column>
            <el-table-column prop="options" label="选项" width="300">
              <template v-slot="scope">
                <div v-for="(option, idx) in scope.row.options" :key="idx">
                  {{ String.fromCharCode(65 + idx) }}. {{ option.content }}
                </div>
              </template>
            </el-table-column>
            <el-table-column prop="answer" label="正确答案" width="120">
              <template v-slot="scope">
                <span>
                  <div v-for="(option, idx) in scope.row.answer" :key="idx">
                    {{ String.fromCharCode(65 + option) }}
                  </div>
                </span>
              </template>
            </el-table-column>
            <el-table-column prop="Explanation" label="解析" width="200"></el-table-column>
          </el-table>
          <span slot="footer" class="dialog-footer">
            <el-button @click="previewVisible = false">取消</el-button>
            <el-button type="primary" @click="submitAddForm" :loading="loading">确认提交</el-button>
          </span>
        </el-form>
      </el-dialog>
      <!-- 表格区域 -->
      <div class="table-container">
        <el-table :data="tableData" stripe row-key="id" style="width: 100%">
          <el-table-column prop="id" label="ID" min-width="200" />

          <el-table-column prop="type" label="轮播图" min-width="180">
            <template v-slot="scope">
              <!-- 使用 getImageUrl 来处理 URL -->
                  <img :src="getImageUrl(scope.row.type, scope.row.url)" alt="轮播图" style="max-width: 100%; height: auto;" />
            </template>
          </el-table-column>
          
          <el-table-column prop="type" label="轮播图类型" min-width="180">
          </el-table-column>

          <el-table-column prop="created_at" label="创建时间" width="180" />
          <el-table-column prop="createdBy" label="创建人" width="180" />
          <el-table-column prop="status" label="是否启用" width="180">
            <template v-slot="scope">
              <el-switch v-model="scope.row.status" :active-color="'#13ce66'" :inactive-color="'#ff4949'"
                active-text="启用" inactive-text="禁用" :active-value="1" :inactive-value="2"
                @change="cstatuschange(scope.row.id, scope.row.status)"></el-switch>
            </template>
          </el-table-column>

          <el-table-column label="更多操作" width="150" fixed="right">
            <template #default="{ row }">
              <el-button @click="deleteban(row.id)" type="text" size="small" style="color: red">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
        <!-- 分页组件 -->
        <el-pagination :current-page="pageNum" :page-size="pageSize" :total="total" @current-change="handlePageChange"
          layout="total, prev, pager, next, jumper"></el-pagination>
        <el-dialog v-model="addDialogVisible" title="添加轮播图" width="80%" :close-on-click-modal="false"
          class="question-editor">
          <el-form :model="singleForm" label-width="80px" ref="singleFormRef">
            <el-row :gutter="20">
              <el-col :span="12">
                <!-- 选择分类 -->
                <el-form-item label="分类" required>
                  <el-select v-model="singleForm.type" placeholder="请选择分类" class="w-full">
                    <el-option label="外部链接" value="external"></el-option>
                    <el-option label="内部上传" value="internal"></el-option>
                  </el-select>
                </el-form-item>

                <!-- 外部链接输入 -->
                <el-form-item v-if="singleForm.type === 'external'" label="图片链接">
                  <el-input v-model="singleForm.url" placeholder="请输入外部图片链接"></el-input>
                </el-form-item>

                <!-- 内部上传 -->
                <el-form-item v-if="singleForm.type === 'internal'" label="上传图片">
                  <el-upload ref="uploadRef" class="upload-demo" action="#" :before-upload="beforeUpload"
                    list-type="picture-card" :auto-upload="false" :limit="1" :on-change="handleFileChange"
                    :on-remove="handleRemove">
                    
                    <el-icon>
                      <Plus />
                    </el-icon>
                  </el-upload>
                </el-form-item>

                <!-- 排序 -->
                <el-form-item label="排序">
                  <el-input v-model="singleForm.sort" placeholder="请输入排序" type="number" />
                </el-form-item>

                <!-- 提交按钮 -->
                <el-form-item>
                  <el-button type="primary" @click="submitForm">提交</el-button>
                </el-form-item>
              </el-col>

              <!-- 右侧预览 -->
              <el-col :span="12">
                <el-form-item v-if="singleForm.url" label="轮播图预览">
                  <el-image style="width: 200px; height: 120px" :src="singleForm.url" fit="cover" />
                </el-form-item>
              </el-col>
            </el-row>
          </el-form>
          <template #footer>
            <div class="dialog-footer">
              <el-button @click="addDialogVisible = false">取消</el-button>
              <el-button type="primary" @click="submitsingle">确定</el-button>
            </div>
          </template>
        </el-dialog>

        <el-dialog v-model="updateDialogVisible" title="编辑问题" width="80%" :close-on-click-modal="false"
          class="question-editor">
          <el-form :model="updateForm" ref="updateFormRef" label-width="80px">
            <el-row :gutter="20">
              <!-- 左侧部分（其他内容） -->
              <el-col :span="12">
                <!-- 标题和分类 -->
                <el-form-item label="分类" required>
                  <el-select v-model="updateForm.categoryId" placeholder="请选择分类" class="w-full">
                    <el-option v-for="cate in categoryData" :key="cate.id" :label="cate.category"
                      :value="cate.id"></el-option>
                  </el-select>
                </el-form-item>

                <!-- 难度评级 -->
                <el-form-item label="难度" required>
                  <el-rate v-model="updateForm.difficulty" :max="5" />
                </el-form-item>

                <!-- 问题类型选择 -->
                <el-form-item label="问题类型" required>
                  <el-radio-group v-model="updateForm.type" class="question-type-group">
                    <el-radio-button :label="1">判断题</el-radio-button>
                    <el-radio-button :label="2">单选题</el-radio-button>
                    <el-radio-button :label="3">多选题</el-radio-button>
                  </el-radio-group>
                </el-form-item>

                <!-- 答案选项区域 -->
                <el-form-item label="选项" required>
                  <template v-if="updateForm.type !== 1">
                    <!-- 判断题对应 1，其他为单选或多选 -->
                    <div class="answer-options">
                      <div class="options-header">
                        <span>答案选项</span>
                        <el-button type="primary" link @click="addOption2">
                          <el-icon>
                            <Plus />
                          </el-icon>添加选项
                        </el-button>
                      </div>

                      <div v-for="(option, index) in updateForm.options" :key="index" class="option-item"
                        style="margin-bottom: 10px">
                        <el-input v-model="option.content" placeholder="请输入选项内容">
                          <template #prepend>
                            <div class="option-label">
                              {{ String.fromCharCode(65 + index) }}
                            </div>
                          </template>
                          <template #append>
                            <el-button @click="removeOption2(index)" link type="danger">
                              <el-icon>
                                <Minus />
                              </el-icon>
                            </el-button>
                          </template>
                        </el-input>
                      </div>
                    </div>
                  </template>
                </el-form-item>

                <!-- 答案区域 -->
                <el-form-item label="答案" required>
                  <!-- 判断题 -->
                  <template v-if="updateForm.type === 1">
                    <el-radio-group v-model="updateForm.TF">
                      <el-radio :label="0">正确</el-radio>
                      <el-radio :label="1">错误</el-radio>
                    </el-radio-group>
                  </template>

                  <template v-else-if="updateForm.type === 2">
                    <el-radio-group v-model="updateForm.answer">
                      <el-checkbox v-for="(option, index) in updateForm.options" :key="index"
                        :label="String.fromCharCode(65 + index)" :checked="option.is_correct">
                        {{ String.fromCharCode(65 + index) }}. {{ option.content }}
                      </el-checkbox>
                    </el-radio-group>
                  </template>

                  <!-- 多选题 -->
                  <template v-else-if="updateForm.type === 3">
                    <el-checkbox-group v-model="updateForm.answer">
                      <el-checkbox v-for="(option, index) in updateForm.options" :key="option.id" :label="option.id"
                        :checked="option.is_correct">
                        {{ String.fromCharCode(65 + index) }}. {{ option.content }}
                      </el-checkbox>
                    </el-checkbox-group>
                  </template>
                </el-form-item>
              </el-col>

              <!-- 右侧部分（轮播图和答案解析） -->
              <el-col :span="12">
                <el-form-item label="轮播图" required>
                  <el-input v-model="updateForm.content" type="textarea" rows="4" placeholder="请输入标题" />
                </el-form-item>

                <!-- 答案解析 -->
                <el-form-item label="答案分析">
                  <el-input v-model="updateForm.explanation" type="textarea" rows="4" placeholder="请输入答案解析" />
                </el-form-item>
              </el-col>
            </el-row>
          </el-form>

          <template #footer>
            <div class="dialog-footer">
              <el-button @click="updateDialogVisible = false">取消</el-button>
              <el-button type="primary" @click="submitUpdateForm()">确定</el-button>
            </div>
          </template>
        </el-dialog>
      </div>
    </div>
  </el-container>
</template>

<script setup>
import { ref, onMounted, getCurrentInstance } from "vue";
import { Plus, Search, Refresh, ArrowDown } from "@element-plus/icons-vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { useStore } from "vuex";



const { proxy } = getCurrentInstance();

const tableData = ref([]);

const categoryData = ref([]);


const addFormRef = ref([]);
const updateFormRef = ref(null);


const isExpanded = ref(true);

const addDialogVisible = ref(false);
const updateDialogVisible = ref(false);
const uploadVisible = ref(false);
const previewVisible = ref(false);



const rules = {
  banName: [{ required: true, message: "请输入轮播图名称" }],
};
const searchFormRef = ref();
const searchForm = ref({
  pageNum: "",
  pageSize: "",
  content: "",
  category: "",
  difficulty: "",
  type: "",
  status: "",
  beginTime: "",
  createdBy: "",
  endTime: "",
});

const updateForm = ref({
  url: "",
  sort: 0,
  createdBy: "",
  type: 0,
  id: 0,
});

const singleForm = ref({
  url: "",
  sort: 0,
  createdBy: "",
  type: 0,
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
    const response = proxy.$api.banupdatestatus(params); // 确保接口路径正确
    // 处理接口返回的结果
    if (response.success) {
    } else {
    }
  } catch (error) { }
};

const getbanList = () => {
  proxy.$api
    .banlist(searchForm.value)
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
      ElMessage.error("获取轮播图列表失败");
      console.error("获取轮播图列表失败:", err.response ? err.response.data : err);
    });
};

const singleFormRef = ref(null); // 对应对话框中的表单
const sysAdmin = proxy.$store.state.sysAdmin;
const submitsingle = () => {
  const formData = new FormData();
  formData.append('type', singleForm.value.type);
  formData.append('sort', singleForm.value.sort);
  formData.append('createdBy', sysAdmin.ID);

  if (singleForm.value.type === 'internal' && singleForm.file) {
    formData.append('file', singleForm.file);
  } else if (singleForm.value.type === 'external') {
    formData.append('url', singleForm.value.url);
  }

  proxy.$api.banadd(formData)
    .then(response => {
      console.log('✅ 上传成功', response);
      
      // 显示成功消息
      ElMessage.success("添加成功");

      // 重新获取数据
      getbanList();
    })
    .catch(error => {
      console.error('❌ 上传失败', error);
      
      // 显示错误消息
      ElMessage.error("上传失败，请重试");
    });
};


const submitAddForm = () => {
  const formData = new FormData();
  const createdBy = Number(sysAdmin.id);
  // 直接追加字段（不要嵌套在data字段）
  formData.append('type', singleForm.type);
  formData.append('sort', singleForm.sort);
  formData.append('createdBy', createdBy);

  // 内部上传添加文件
  if (singleForm.type === 'internal' && singleForm.file) {
    formData.append('file', singleForm.file);
  } 
  // 外部链接添加URL
  else if (singleForm.type === 'external') {
    formData.append('url', singleForm.url);
  }

  // 调用接口发送请求
  proxy.$api.banadd(formData).then(response => {
    // 处理成功逻辑
    console.log('上传成功', response);
  }).catch(error => {
    // 处理失败逻辑
    console.error('上传失败', error);
  });
};
const handleFileChange = (file, fileList) => {
  // 选中的文件保存到 singleForm.file
  singleForm.file = file.raw;  // raw 是文件对象
};



const submitUpdateForm = () => {
  updateFormRef.value.validate((valid) => {
    if (!valid) {
      return ElMessage.error("请填写完整的表单数据");
    }
    console.log(updateForm.answer); // 这里可以看到选中的答案
    console.log("请求数据:", updateForm.value); // 打印请求数据
    proxy.$api
      .banupdate(updateForm.value)
      .then((res) => {
        if (res.code == 200) {
          ElMessage.success("轮播图修改成功");
          getbanList();
        } else {
          ElMessage.error("轮播图修改失败");
        }
      })
      .catch((err) => {
        console.log("请求失败:", err);
        ElMessage.error("修改轮播图失败");
      });
  }); // 调用轮播图更新接口
};

const beforeUpload = (file) => {
  // 判断文件类型是否为图片，支持 JPG, PNG, JPEG
  const isImage = file.type.startsWith('image/') || ['.jpg', '.jpeg', '.png'].includes(file.name.slice(-4).toLowerCase());

  if (!isImage) {
    ElMessage.error("只支持 JPG, PNG, JPEG 格式的图片");
  }
  return isImage;  // 如果是图片类型，允许上传
};


const confirmUpload = (request) => {
  const file = request.file;
  const formData = new FormData();
  formData.append("file", file);

  // 调用封装的API方法上传文件
  proxy.$api
    .batchadd(formData) // 使用封装的API方法
    .then((response) => {
      ElMessage.success("文件上传成功");
      request.onSuccess(response); // 调用成功回调
    })
    .catch((error) => {
      ElMessage.error("文件上传失败");
      request.onError(error); // 调用失败回调
    });
};

const parsedbans = ref([]);
const handleUploadSuccess = (response, file, fileList) => {

};

const handleUploadError = (err, file, fileList) => {
  ElMessage.error("文件上传失败");
};

const resetSearch = () => {
  searchForm.value.username = "";
  searchForm.value.status = "";
  searchForm.value.beginTime = "";
  searchForm.value.endTime = "";
  getbanList();
};

const showAddDialog = () => {
  addDialogVisible.value = true;
};
const showUpload = () => {
  uploadVisible.value = true;
};
onMounted(() => {
  getbanList();
});

const addOption = () => {
  console.log(singleForm.value.options); // 检查 options 是否为空数组
  if (singleForm.value.options.length < 26) {
    singleForm.value.options.push({ content: "" });
  } else {
    ElMessage.error("最多可以添加26个选项");
    return;
  }
};

const removeOption = (index) => {
  singleForm.value.options.splice(index, 1);
};

const addOption2 = () => {
  console.log(addForm.value.options); // 检查 options 是否为空数组
  if (updateForm.value.options.length < 26) {
    updateForm.value.options.push({ content: "" });
  } else {
    ElMessage.error("最多可以添加26个选项");
    return;
  }
};
const removeOption2 = (index) => {
  updateForm.value.options.splice(index, 1);
};

const deleteban = (id) => {
  // 弹出确认框
  ElMessageBox.confirm("确定删除该轮播图吗？", "删除轮播图", {
    confirmButtonText: "删除",
    cancelButtonText: "取消",
    type: "warning",
  })
    .then(() => {
      // 用户确认删除，构造删除请求的结构体
      const deleteRequest = {
        id: id, // 这里传入你想要删除的轮播图ID
      };

      // 发送删除请求
      proxy.$api.deletebans(deleteRequest).then((res) => {
        if (res.code == 200) {
          ElMessage.success("轮播图删除成功");
          getbanList(); // 删除成功后重新加载轮播图列表
        } else {
          ElMessage.error("轮播图删除失败");
        }
      });
    })
    .catch(() => {
      // 用户取消删除
      ElMessage.info("删除操作已取消");
    });
};

const pageNum = ref(null); // 当前页数
const pageSize = ref(null); // 每页显示数量
const total = ref(null); // 总记录数

const getImageUrl = (type, url) => {
  if (!url) return ''; // 如果 url 为空，返回空字符串
  if (type === 'external') {
    console.log('External URL:', url); // 调试信息
    return url; // 外部链接直接返回
  }
  // 使用 URL 对象拼接
  const backendUrl = import.meta.env.VITE_API_BASE_URL;
  const fullUrl = new URL(url, backendUrl).toString();
  console.log('Local URL:', fullUrl); // 调试信息
  return fullUrl; // 动态拼接后端地址
};

// 页码变化时触发的处理函数
const handlePageChange = (newPage) => {
  pageNum.value = newPage;
  fetchData();
};

const submitUpload = () => {
  if (this.fileList.length === 0) {
    ElMessage.error("请先选择图片");
    return;
  }

  const file = this.fileList[0].raw; // 获取文件对象
  const formData = new FormData();
  formData.append("file", file);

  fetch(this.uploadUrl, {
    method: "POST",
    body: formData,
  })
    .then((response) => response.json())
    .then((res) => {
      if (res.code === 200) {
        ElMessage.success("上传成功");
        this.singleForm.url = res.data.url; // 存储图片 URL
      } else {
        ElMessage.error("上传失败");
      }
    })
    .catch(() => {
      ElMessage.error("上传错误");
    });
}
</script>

<style scoped>
/* 保持原有的样式不变 */
.home_container {
  padding: 30px;
  background-color: #fff;
  border-radius: 10px;
  min-height: calc(100vh - 60px);
}

.ban-layout {
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

.ban-table :deep(.el-table__row) {
  .el-button {
    font-size: 13px;
    margin: 0 4px;
  }
}

.ban-table :deep(.el-table__expand-icon) {
  margin-right: 8px;
}

.ban-table :deep(.el-tag) {
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
