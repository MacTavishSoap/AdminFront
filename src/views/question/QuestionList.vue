<template>
  <el-container class="home_container">
    <div class="question-layout">
      <!-- 搜索区域 -->
      <el-form
        :model="searchForm"
        :rules="rules"
        ref="searchFormRef"
        :inline="true"
        class="search-form"
      >
        <el-form-item label="题目名称">
          <el-input v-model="searchForm.content" placeholder="请输入题目名称" />
        </el-form-item>

        <el-form-item label="题目种类">
          <el-select v-model="searchForm.categoryid" placeholder="请选择类型">
            <el-option
              v-for="cate in categoryData"
              :key="cate.id"
              :label="cate.category"
              :value="cate.id"
            ></el-option>
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

        <el-form-item label="题目类型">
          <el-select v-model="searchForm.type" placeholder="请选择类型">
            <el-option label="启用" value="enabled" />
            <el-option label="禁用" value="disabled" />
          </el-select>
        </el-form-item>

        <el-form-item label="题目状态">
          <el-select v-model="searchForm.status" placeholder="请选择题目状态">
            <el-option label="启用" value="enabled" />
            <el-option label="禁用" value="disabled" />
          </el-select>
        </el-form-item>

        <el-form-item label="创建人">
          <el-input v-model="searchForm.createBy" placeholder="请输入创建人" />
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
          <el-button type="primary" @click="getquestionList">
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
        <el-button type="primary" @click="showUpload">上传题目</el-button>
      </div>

      <!-- 上传组件 -->
      <el-dialog title="上传题目文件" v-model="uploadVisible" width="30%">
        <el-upload
          class="upload-demo"
          drag
          :before-upload="beforeUpload"
          :on-success="handleUploadSuccess"
          :on-error="handleUploadError"
          :show-file-list="true"
          :http-request="confirmUpload"
          action=" "
        >
          <i class="el-icon-upload"></i>
          <div class="el-upload__text">点击或拖动文件上传</div>
          <div class="el-upload__tip" slot="tip">支持 txt 文件</div>
        </el-upload>

        <!-- 添加格式示例 -->
        <div class="format-example">
          <h4>格式示例：</h4>
          <pre>
1.（    ）全长1956千米，被誉为"天路"，是世界上海拔最高、在冻土上路程最长的高原铁路，是"中国新世纪四大工程"之一。
A.兰新铁路
B.青藏铁路
C.北疆铁路
D.南疆铁路
参考答案：B
解析：测试

2.教育学的发展总是受到具体的社会政治、经济、文化条件的制约。（）
参考答案:正确
解析:教育学的发展总是与具体的社会政治、经济、文化条件密切相关，反映着这些条件的变化和要求。

3.让一个4岁半的幼儿看"牛、人、船、猪"四张图，要求拿出不同的一张，他拿出了"船"，是因为（    ）。
A.他认为牛、人、猪经常在一起出现，而船不是
B.他认为船是没有生命的，而另外的都是有生命的
C.他认为牛、人、猪都有头、脚和身体，而船没有
D.以上理由都不正确
参考答案：CB

4. 求解方程 $x^2 - 5x + 6 = 0$。
A. $x = 2$ 或 $x = 3$
B. $x = 1$ 或 $x = 6$
C. $x = -2$ 或 $x = -3$
D. $x = 0$ 或 $x = 5$
参考答案：A
解析：因式分解得 $(x-2)(x-3) = 0$，所以 $x = 2$ 或 $x = 3$。
    </pre
          >
        </div>

        <span slot="footer" class="dialog-footer">
          <el-button @click="uploadVisible = false">取消</el-button>
        </span>
      </el-dialog>

      <!-- 解析后的文件数据预览 -->
      <el-dialog title="文件解析结果" v-model="previewVisible" width="50%">
        <!-- 统计信息 -->

        <el-form :model="addForm" ref="addFormRef" label-width="80px">
          <el-form-item label="分类" required>
            <el-select v-model="ctid.categoryId" placeholder="请选择分类" class="w-full">
              <el-option
                v-for="cate in categoryData"
                :key="cate.id"
                :label="cate.category"
                :value="cate.id"
              ></el-option>
            </el-select>
          </el-form-item>
          <el-table :data="parsedQuestions" style="width: 100%">
            <el-table-column
              prop="content"
              label="题目内容"
              width="200"
            >
              <template v-slot="scope">
                <div v-html="formatMathText(scope.row.content)"></div>
              </template>
            </el-table-column>
            <el-table-column prop="options" label="选项" width="300">
              <template v-slot="scope">
                <div v-for="(option, idx) in scope.row.options" :key="idx">
                  {{ String.fromCharCode(65 + idx) }}. <span v-html="formatMathText(option.content)"></span>
                </div>
              </template>
            </el-table-column>
            <el-table-column prop="answer" label="正确答案" width="120">
              <template v-slot="scope">
                <!-- 如果 answer 不为空，则显示 answer -->
                <span v-if="scope.row.type === 1">{{ scope.row.tf == "0" ? "正确" : "错误" }}</span>
                <!-- 如果 answer 为空，则根据 tf 的值显示对错标识 -->
                <span v-else>{{ scope.row.answer}}</span>
              </template>
            </el-table-column>
            <el-table-column
              prop="explanation"
              label="解析"
              width="200"
            >
              <template v-slot="scope">
                <div v-html="formatMathText(scope.row.explanation)"></div>
              </template>
            </el-table-column>
          </el-table>
          <span slot="footer" class="dialog-footer">
            <span>总题数: {{ parsedQuestions.length }}</span>
            <el-button @click="previewVisible = false">取消</el-button>
            <el-button type="primary" @click="submitAddForm" :loading="loading"
              >确认提交</el-button
            >
          </span>
        </el-form>
      </el-dialog>
      <!-- 表格区域 -->
      <div class="table-container">
        <el-table :data="tableData" stripe row-key="id" style="width: 100%">
          <el-table-column prop="id" label="ID" min-width="200" />
          <el-table-column prop="content" label="题目名称" min-width="180" />
          <el-table-column prop="categoryId" label="题目种类" min-width="180">
            <template v-slot="scope">
              <span
                >{{
                  categoryData.find((item) => item.id === scope.row.categoryId)
                    ?.category || "未知"
                }}
              </span>
            </template>
          </el-table-column>
          <el-table-column prop="type" label="题目类型" min-width="180">
            <template v-slot="scope">
              <span v-if="scope.row.type === 1">判断题</span>
              <span v-if="scope.row.type === 2">单选题</span>
              <span v-if="scope.row.type === 3">多选题</span>
            </template>
          </el-table-column>

          <el-table-column label="难度" min-width="180">
            <template v-slot="scope">
              <el-rate v-model="scope.row.difficulty" :max="5" disabled></el-rate>
            </template>
          </el-table-column>

          <el-table-column prop="created_at" label="创建时间" width="180" />
          <el-table-column prop="createdBy" label="创建人" width="180" />
          <el-table-column prop="status" label="是否启用" width="180">
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
          <el-table-column prop="explanation" label="解析" width="180" />

          <el-table-column label="更多操作" width="150" fixed="right">
            <template #default="{ row }">
              <el-button link type="primary" size="small" @click="showupdateDialog(row)"
                >修改</el-button
              >
              <el-button
                @click="deletequestion(row.id)"
                type="text"
                size="small"
                style="color: red"
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
        <el-dialog
          v-model="addDialogVisible"
          title="添加题目"
          width="80%"
          :close-on-click-modal="false"
          class="question-editor"
        >
          <el-form :model="singleForm" label-width="80px" ref="singleFormRef">
            <el-row :gutter="20">
              <!-- 左侧部分（其他内容） -->
              <el-col :span="12">
                <!-- 标题和分类 -->
                <el-form-item label="分类" required>
                  <el-select
                    v-model="updateForm.categoryId"
                    placeholder="请选择分类"
                    class="w-full"
                  >
                    <el-option
                      v-for="cate in categoryData"
                      :key="cate.id"
                      :label="`${cate.category} (${cate.id})`"
                      :value="cate.id"
                    ></el-option>
                  </el-select>
                </el-form-item>

                <!-- 难度评级 -->
                <el-form-item label="难度" required>
                  <el-rate v-model="singleForm.difficulty" :max="5" />
                </el-form-item>

                <!-- 问题类型选择 -->
                <el-form-item label="问题类型" required>
                  <el-radio-group v-model="singleForm.type" class="question-type-group">
                    <el-radio-button :label="1">判断题</el-radio-button>
                    <el-radio-button :label="2">单选题</el-radio-button>
                    <el-radio-button :label="3">多选题</el-radio-button>
                  </el-radio-group>
                </el-form-item>

                <!-- 答案选项区域 -->
                <el-form-item label="选项" required>
                  <template v-if="singleForm.type !== 1">
                    <!-- 判断题对应 1，其他为单选或多选 -->
                    <div class="answer-options">
                      <div class="options-header">
                        <span>答案选项</span>
                        <el-button type="primary" link @click="addOption">
                          <el-icon><Plus /></el-icon>添加选项
                        </el-button>
                      </div>

                      <div
                        v-for="(option, index) in singleForm.options"
                        :key="index"
                        class="option-item"
                        style="margin-bottom: 10px"
                      >
                        <el-input v-model="option.content" placeholder="请输入选项内容">
                          <template #prepend>
                            <div class="option-label">
                              {{ String.fromCharCode(65 + index) }}
                            </div>
                          </template>
                          <template #append>
                            <el-button @click="removeOption(index)" link type="danger">
                              <el-icon><Minus /></el-icon>
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
                  <template v-if="singleForm.type === 1">
                    <el-radio-group v-model="singleForm.TF">
                      <el-radio :label="0">正确</el-radio>
                      <el-radio :label="1">错误</el-radio>
                    </el-radio-group>
                  </template>

                  <!-- 单选题 -->
                  <template v-else-if="singleForm.type === 2">
                    <el-radio-group v-model="singleForm.answer">
                      <el-radio
                        v-for="(_, index) in singleForm.options"
                        :key="index"
                        :label="String.fromCharCode(65 + index)"
                      >
                        {{ String.fromCharCode(65 + index) }}
                      </el-radio>
                    </el-radio-group>
                  </template>

                  <!-- 多选题 -->
                  <template v-else-if="singleForm.type === 3">
                    <el-checkbox-group v-model="singleForm.answer">
                      <el-checkbox
                        v-for="(_, index) in singleForm.options"
                        :key="index"
                        :label="String.fromCharCode(65 + index)"
                      >
                        {{ String.fromCharCode(65 + index) }}
                      </el-checkbox>
                    </el-checkbox-group>
                  </template>
                </el-form-item>
              </el-col>

              <!-- 右侧部分（题目和答案解析） -->
              <el-col :span="12">
                <el-form-item label="题目" required>
                  <el-input
                    v-model="singleForm.content"
                    type="textarea"
                    rows="4"
                    placeholder="请输入标题"
                  />
                </el-form-item>

                <!-- 答案解析 -->
                <el-form-item label="答案分析">
                  <el-input
                    v-model="singleForm.explanation"
                    type="textarea"
                    rows="4"
                    placeholder="请输入答案解析"
                  />
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

        <el-dialog
          v-model="updateDialogVisible"
          title="编辑问题"
          width="80%"
          :close-on-click-modal="false"
          class="question-editor"
        >
          <el-form :model="updateForm" ref="updateFormRef" label-width="80px">
            <el-row :gutter="20">
              <!-- 左侧部分（其他内容） -->
              <el-col :span="12">
                <!-- 标题和分类 -->
                <el-form-item label="分类" required>
                  <el-select
                    v-model="updateForm.categoryId"
                    placeholder="请选择分类"
                    class="w-full"
                  >
                    <el-option
                      v-for="cate in categoryData"
                      :key="cate.id"
                      :label="`${cate.category} (${cate.id})`"
                      :value="cate.id"
                    ></el-option>
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
                          <el-icon><Plus /></el-icon>添加选项
                        </el-button>
                      </div>

                      <div
                        v-for="(option, index) in updateForm.options"
                        :key="index"
                        class="option-item"
                        style="margin-bottom: 10px"
                      >
                        <el-input v-model="option.content" placeholder="请输入选项内容">
                          <template #prepend>
                            <div class="option-label">
                              {{ String.fromCharCode(65 + index) }}
                            </div>
                          </template>
                          <template #append>
                            <el-button @click="removeOption2(index)" link type="danger">
                              <el-icon><Minus /></el-icon>
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
                      <el-checkbox
                        v-for="(option, index) in updateForm.options"
                        :key="index"
                        :label="String.fromCharCode(65 + index)"
                        :checked="option.is_correct"
                      >
                        {{ String.fromCharCode(65 + index) }}. {{ option.content }}
                      </el-checkbox>
                    </el-radio-group>
                  </template>

                  <!-- 多选题 -->
                  <template v-else-if="updateForm.type === 3">
                    <el-checkbox-group v-model="updateForm.answer">
                      <el-checkbox
                        v-for="(option, index) in updateForm.options"
                        :key="option.id"
                        :label="option.id"
                        :checked="option.is_correct"
                      >
                        {{ String.fromCharCode(65 + index) }}. {{ option.content }}
                      </el-checkbox>
                    </el-checkbox-group>
                  </template>
                </el-form-item>
              </el-col>

              <!-- 右侧部分（题目和答案解析） -->
              <el-col :span="12">
                <el-form-item label="题目" required>
                  <el-input
                    v-model="updateForm.content"
                    type="textarea"
                    rows="4"
                    placeholder="请输入标题"
                  />
                </el-form-item>

                <!-- 答案解析 -->
                <el-form-item label="答案分析">
                  <el-input
                    v-model="updateForm.explanation"
                    type="textarea"
                    rows="4"
                    placeholder="请输入答案解析"
                  />
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
import { ref, onMounted, getCurrentInstance, computed } from "vue";
import { Plus, Search, Refresh, ArrowDown, Minus } from "@element-plus/icons-vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { useStore } from "vuex";
import { formatMathText, getMathStyles } from "@/utils/mathRenderer";

const store = useStore();

const { proxy } = getCurrentInstance();
const tableRef = ref([]);
const tableData = ref([]);

const categoryData = ref([]);
const categoryRef = ref([]);

const addFormRef = ref([]);
const updateFormRef = ref(null);
const questionlist = ref([]);

const isExpanded = ref(true);
const permissionDialogVisible = ref(false);
const addDialogVisible = ref(false);
const updateDialogVisible = ref(false);
const uploadVisible = ref(false);
const previewVisible = ref(false);
const loading = ref(false);

const activeTab = ref("questionType");

const rules = {
  questionName: [{ required: true, message: "请输入题目名称" }],
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
  answer: [],
  categoryId: 0,
  content: "",
  difficulty: 5,
  tf: "0",
  explanation: "string",
  id: 0,
  options: [],
  type: 0,
});

const singleForm = ref({
  answer: [],
  categoryId: 1,
  content: "string",
  createdBy: 0,
  difficulty: 1,
  explanation: "无",
  options: [],
  status: 1,
  tf: 0,
  type: 0,
});
const ctid = ref({
  categoryId: 1,
});
const addForm = ref([
  {
    answer: [],
    categoryId: 1,
    content: "string",
    createdBy: 0,
    difficulty: 1,
    explanation: "无",
    options: [],
    status: 1,
    tf: "",
    type: 0,
  },
]);

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
    const response = proxy.$api.questionupdatestatus(params); // 确保接口路径正确
    // 处理接口返回的结果
    if (response.success) {
    } else {
    }
  } catch (error) {}
};

const getcategoryList = () => {
  proxy.$api
    .questionvolist()
    .then((res) => {
      categoryData.value = res.data || [];
      console.log(categoryData.value);
    })
    .catch((err) => {
      ElMessage.error("获取题目列表失败");
      console.error("获取题目列表失败:", err);
    });
};

const getquestionList = () => {
  proxy.$api
    .questionlist(searchForm.value)
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
      ElMessage.error("获取题目列表失败");
      console.error("获取题目列表失败:", err.response ? err.response.data : err);
    });
};

const singleFormRef = ref(null); // 对应对话框中的表单

const submitsingle = () => {
  singleFormRef.value.validate((valid) => {
    // 验证单个表单
    if (!valid) {
      return ElMessage.error("请填写完整的表单数据");
    }
    if (!Array.isArray(singleForm.value.answer)) {
      singleForm.value.answer = [singleForm.value.answer];
    }
    // 将 singleForm 添加到 addForm 数组中
    addForm.value[0] = singleForm.value;

    console.log("数据", addForm.value);
    // 提交到后端
    proxy.$api
      .questionadd(addForm.value)
      .then((res) => {
        if (res.code === 200) {
          ElMessage.success("题目增加成功");
          getquestionList();
          addDialogVisible.value = false; // 关闭对话框
        }
      })
      .catch((err) => {
        console.log("请求失败:", err);
      });
  });
};

const sysAdmin = proxy.$store.state.sysAdmin;
const submitAddForm = () => {
  // 1. 检查分类是否选择
  if (!ctid.value.categoryId) {
    ElMessage.error("请选择题目分类");
    return;
  }

  // 2. 检查是否有解析的题目数据
  if (!parsedQuestions.value || parsedQuestions.value.length === 0) {
    ElMessage.error("没有可提交的题目数据");
    return;
  }

  // 3. 检查用户权限
  const currentUserId = sysAdmin?.ID;
  if (!currentUserId) {
    ElMessage.error("用户未登录，无法创建题目");
    return;
  }

  // 4. 设置加载状态
  loading.value = true;

  // 5. 确保每个问题的 createdBy 被赋值
  addForm.value = parsedQuestions.value.map((question) => {
    const baseData = {
      ...question,
      createdBy: currentUserId, // 使用当前用户 ID
      categoryId: ctid.value.categoryId,
      tf: question.type === 1 ? question.answer[0] : undefined,
      status: question.status || 1, // 默认启用
      type: question.type,
    };

    if (question.type !== 1) {
      baseData.options = question.options.map((option) => ({
        content: option.content,
      }));
    }

    return baseData;
  });

  // 6. 打印调试信息
  console.log("最终提交数据:", addForm.value);

  // 7. 提交到后端
  proxy.$api
    .questionadd(addForm.value)
    .then((res) => {
      if (res.code === 200) {
        ElMessage.success(`成功添加 ${addForm.value.length} 道题目`);
        getquestionList();
        previewVisible.value = false; // 关闭预览弹窗
        parsedQuestions.value = []; // 清空解析数据
        ctid.value.categoryId = null; // 重置分类选择
      } else {
        ElMessage.error(`提交失败: ${res.message || '未知错误'}`);
      }
    })
    .catch((err) => {
      console.error("提交失败:", err);
      ElMessage.error("新增题目失败，请检查网络连接或联系管理员");
    })
    .finally(() => {
      loading.value = false; // 取消加载状态
    });
};

const submitUpdateForm = () => {
  updateFormRef.value.validate((valid) => {
    if (!valid) {
      return ElMessage.error("请填写完整的表单数据");
    }
    console.log(updateForm.answer); // 这里可以看到选中的答案
    console.log("请求数据:", updateForm.value); // 打印请求数据
    proxy.$api
      .questionupdate(updateForm.value)
      .then((res) => {
        if (res.code == 200) {
          ElMessage.success("题目修改成功");
          getquestionList();
        } else {
          ElMessage.error("题目修改失败");
        }
      })
      .catch((err) => {
        console.log("请求失败:", err);
        ElMessage.error("修改题目失败");
      });
  }); // 调用题目更新接口
};

const beforeUpload = (file) => {
  const isTxt = file.type === "text/plain" || file.name.endsWith(".txt");

  if (!isTxt) {
    ElMessage.error("只支持 TXT 文件");
  }
  return isTxt;
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

const parsedQuestions = ref([]);
const handleUploadSuccess = (response, file, fileList) => {
  if (response.code == 200) {
    parsedQuestions.value = response.data; // 将解析后的数据赋值到 parsedQuestions
    previewVisible.value = true; // 显示预览弹窗
    console.log("解析数据", parsedQuestions);
  } else {
    ElMessage.error("文件解析失败");
  }
};

const handleUploadError = (err, file, fileList) => {
  ElMessage.error("文件上传失败");
};

const resetSearch = () => {
  searchForm.value.username = "";
  searchForm.value.status = "";
  searchForm.value.beginTime = "";
  searchForm.value.endTime = "";
  getquestionList();
};

const showAddDialog = () => {
  addDialogVisible.value = true;
};
const showUpload = () => {
  uploadVisible.value = true;
};

const showupdateDialog = (row) => {
  updateForm.value = {
    id: row.id,
    tf: row.tf,
    categoryId: Number(row.categoryId),
    explanation: row.explanation,
    difficulty: row.difficulty,
    content: row.content, // 映射 role 字段到 roleId
    status: row.status,
    type: row.type,
    options: row.options,
    answer: row.answer.split(","),
  };
  updateDialogVisible.value = true; // 打开弹窗
};

onMounted(() => {
  getquestionList();
  getcategoryList();
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

const deletequestion = (id) => {
  // 弹出确认框
  ElMessageBox.confirm("确定删除该题目吗？", "删除题目", {
    confirmButtonText: "删除",
    cancelButtonText: "取消",
    type: "warning",
  })
    .then(() => {
      // 用户确认删除，构造删除请求的结构体
      const deleteRequest = {
        id: id, // 这里传入你想要删除的题目ID
      };

      // 发送删除请求
      proxy.$api.questiondelete(deleteRequest).then((res) => {
        if (res.code == 200) {
          ElMessage.success("题目删除成功");
          getquestionList(); // 删除成功后重新加载题目列表
        } else {
          ElMessage.error("题目删除失败");
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

// 页码变化时触发的处理函数
const handlePageChange = (newPage) => {
  searchForm.value.pageNum = newPage;
  getquestionList();
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
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.question-layout {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 24px;
  overflow: hidden;
}

.table-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 0 20px;
  min-height: 0;
  overflow: hidden;
}

.table-container :deep(.el-table) {
  flex: 1;
  overflow: auto;
}

.table-container :deep(.el-table__body-wrapper) {
  max-height: calc(100vh - 400px);
  overflow-y: auto;
}

.search-form {
  flex-shrink: 0;
}

/* 数学公式样式 */
:deep(.math-inline) {
  font-family: 'Times New Roman', serif;
  font-style: italic;
  color: #2c3e50;
  padding: 0 2px;
}

:deep(.math-block) {
  font-family: 'Times New Roman', serif;
  font-style: italic;
  color: #2c3e50;
  text-align: center;
  margin: 10px 0;
  padding: 8px;
  background-color: #f8f9fa;
  border-radius: 4px;
  border-left: 3px solid #007bff;
}

:deep(.math-fraction) {
  display: inline-block;
  vertical-align: middle;
  text-align: center;
  margin: 0 2px;
}

:deep(.math-numerator) {
  display: block;
  border-bottom: 1px solid #333;
  padding-bottom: 2px;
  font-size: 0.9em;
}

:deep(.math-denominator) {
  display: block;
  padding-top: 2px;
  font-size: 0.9em;
}

:deep(.math-sqrt) {
  position: relative;
  display: inline-block;
  margin: 0 2px;
}

:deep(.math-sqrt-content) {
  border-top: 1px solid #333;
  padding-top: 2px;
  margin-left: 2px;
}

:deep(sup) {
  font-size: 0.75em;
  vertical-align: super;
}

:deep(sub) {
  font-size: 0.75em;
  vertical-align: sub;
}

.search-form {
  flex-shrink: 0;
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
  flex-shrink: 0;
  display: flex;
  gap: 12px;
  padding: 0 20px;
}

.table-container :deep(.el-pagination) {
  margin-top: 20px;
  display: flex;
  justify-content: center;
  flex-shrink: 0;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .search-form {
    flex-direction: column;
    align-items: stretch;
  }
  
  .home_container {
    padding: 15px;
  }
  
  .action-buttons {
    flex-direction: column;
    gap: 8px;
  }
  
  .table-container {
    padding: 0 10px;
  }
}

.question-table :deep(.el-table__row) {
  .el-button {
    font-size: 13px;
    margin: 0 4px;
  }
}

.question-table :deep(.el-table__expand-icon) {
  margin-right: 8px;
}

.question-table :deep(.el-tag) {
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
.format-example {
  margin-top: 20px;
  padding: 10px;
  background-color: #f8f9fa;
  border-radius: 4px;
}

.format-example h4 {
  margin-bottom: 10px;
  color: #606266;
}

.format-example pre {
  white-space: pre-wrap;
  word-wrap: break-word;
  font-family: monospace;
  color: #666;
  background-color: #fff;
  padding: 10px;
  border-radius: 4px;
  border: 1px solid #ebeef5;
}
</style>
