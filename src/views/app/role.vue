<template>
  <el-container class="home_container">
    <div class="role-layout">
      <!-- 主选项卡 -->
      <el-tabs v-model="mainActiveTab" @tab-change="handleMainTabChange">
        <el-tab-pane label="角色管理" name="role">
          <!-- 角色搜索区域 -->
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
              <el-button type="primary" @click="usergetroleList">
                <el-icon><Search /></el-icon>搜索
              </el-button>
              <el-button @click="resetSearch">
                <el-icon><Refresh /></el-icon>重置
              </el-button>
            </el-form-item>
          </el-form>

          <!-- 角色操作按钮区域 -->
          <div class="action-buttons">
            <el-button type="primary" @click="showAddDialog('role')">
              <el-icon><Plus /></el-icon>新增角色
            </el-button>
          </div>

          <!-- 角色表格区域 -->
          <div class="table-container">
            <el-table :data="roleTableData" stripe row-key="id" style="width: 100%">
              <el-table-column prop="role_name" label="角色名称" min-width="180" />
              <el-table-column prop="user_key" label="角色标识" min-width="180" />
              <el-table-column prop="wrong" label="角色是否可用错题本" width="180">
                <template v-slot="scope">
                  <el-switch
                    v-model="scope.row.wrong"
                    :active-color="'#13ce66'"
                    :inactive-color="'#ff4949'"
                    active-text="启用"
                    inactive-text="禁用"
                    :active-value="1"
                    :inactive-value="2"
                    @change="cstatuswrongchange(scope.row.id, scope.row.wrong)"
                  ></el-switch>
                </template>
              </el-table-column>
              <el-table-column prop="favourite" label="角色是否可用收藏本" width="180">
                <template v-slot="scope">
                  <el-switch
                    v-model="scope.row.favourite"
                    :active-color="'#13ce66'"
                    :inactive-color="'#ff4949'"
                    active-text="启用"
                    inactive-text="禁用"
                    :active-value="1"
                    :inactive-value="2"
                    @change="cstatusfavchange(scope.row.id, scope.row.favourite)"
                  ></el-switch>
                </template>
              </el-table-column>

              <el-table-column prop="count" label="AI解析可用次数" width="180">
                <template #default="scope">
                  <el-input-number
                    v-model="scope.row.count"
                    :min="0"
                    :max="9999"
                    @change="(value) => handleAICountChange(scope.row.id, value)"
                  />
                </template>
              </el-table-column>
              <el-table-column prop="wrongnum" label="错题本题数" width="180">
                <template #default="scope">
                  <el-input-number
                    v-model="scope.row.wrongnum"
                    :min="0"
                    :max="9999"
                    @change="(value) => handlewrongCountChange(scope.row.id, value)"
                  />
                </template>
              </el-table-column>
              <el-table-column prop="favouritenum" label="收藏本题数" width="180">
                <template #default="scope">
                  <el-input-number
                    v-model="scope.row.favouritenum"
                    :min="0"
                    :max="9999"
                    @change="(value) => handlefavCountChange(scope.row.id, value)"
                  />
                </template>
              </el-table-column>
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
                    @click="showLevelPermission(row.id)"
                    type="text"
                    size="small"
                    style="color: grey"
                    >分配权限</el-button
                  >
                  <el-button
                    @click="showCDK(row.user_key)"
                    type="text"
                    size="small"
                    style="color: green"
                    >生成cdk</el-button
                  >
                </template>
              </el-table-column>
            </el-table>
            <!-- 角色分页组件 -->
            <el-pagination
              :current-page="pageNum"
              :page-size="pageSize"
              :total="total"
              @current-change="handlePageChange"
              layout="total, prev, pager, next, jumper"
            ></el-pagination>
          </div>
        </el-tab-pane>

        <el-tab-pane label="等级管理" name="level">
          <!-- 等级搜索区域 -->
          <el-form
            :model="levelSearchForm"
            :rules="rules"
            ref="levelSearchFormRef"
            :inline="true"
            class="search-form"
          >
            <el-form-item label="等级名称">
              <el-input v-model="levelSearchForm.roleName" placeholder="请输入等级名称" />
            </el-form-item>
            <el-form-item label="等级状态">
              <el-select v-model="levelSearchForm.status" placeholder="请选择等级状态">
                <el-option label="启用" value="enabled" />
                <el-option label="禁用" value="disabled" />
              </el-select>
            </el-form-item>
            <el-form-item label="开始时间">
              <el-date-picker
                v-model="levelSearchForm.beginTime"
                placeholder="请输入开始时间"
                :picker-options="pickerOptions"
              />
            </el-form-item>
            <el-form-item label="结束时间">
              <el-date-picker
                v-model="levelSearchForm.endTime"
                placeholder="请输入结束时间"
                :picker-options="pickerOptions"
              />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="getLevelList">
                <el-icon><Search /></el-icon>搜索
              </el-button>
              <el-button @click="resetLevelSearch">
                <el-icon><Refresh /></el-icon>重置
              </el-button>
            </el-form-item>
          </el-form>

          <!-- 等级操作按钮区域 -->
          <div class="action-buttons">
            <el-button type="primary" @click="showAddDialog('level')">
              <el-icon><Plus /></el-icon>新增等级
            </el-button>
          </div>

          <!-- 等级表格区域 -->
          <div class="table-container">
            <el-table :data="levelTableData" stripe row-key="id" style="width: 100%">
              <el-table-column prop="role_name" label="等级名称" min-width="120" />
              <el-table-column prop="user_key" label="等级标识" min-width="120" />
              <el-table-column prop="required_points" label="所需积分" width="150">
                <template #default="scope">
                  <el-input-number
                    v-model="scope.row.required_points"
                    :min="0"
                    :max="999999"
                    size="small"
                    @change="(value) => handleRequiredPointsChange(scope.row.id, value)"
                  />
                </template>
              </el-table-column>
              <el-table-column prop="wrong" label="错题本可用" width="150">
                <template v-slot="scope">
                  <el-switch
                    v-model="scope.row.wrong"
                    :active-color="'#13ce66'"
                    :inactive-color="'#ff4949'"
                    active-text="启用"
                    inactive-text="禁用"
                    :active-value="1"
                    :inactive-value="2"
                    size="small"
                    @change="cstatuswrongchange(scope.row.id, scope.row.wrong)"
                  ></el-switch>
                </template>
              </el-table-column>
              <el-table-column prop="favourite" label="收藏本可用" width="150">
                <template v-slot="scope">
                  <el-switch
                    v-model="scope.row.favourite"
                    :active-color="'#13ce66'"
                    :inactive-color="'#ff4949'"
                    active-text="启用"
                    inactive-text="禁用"
                    :active-value="1"
                    :inactive-value="2"
                    size="small"
                    @change="cstatusfavchange(scope.row.id, scope.row.favourite)"
                  ></el-switch>
                </template>
              </el-table-column>
              <el-table-column prop="count" label="AI解析次数" width="150">
                <template #default="scope">
                  <el-input-number
                    v-model="scope.row.count"
                    :min="0"
                    :max="9999"
                    size="small"
                    @change="(value) => handleAICountChange(scope.row.id, value)"
                  />
                </template>
              </el-table-column>
              <el-table-column prop="wrongnum" label="错题本题数" width="150">
                <template #default="scope">
                  <el-input-number
                    v-model="scope.row.wrongnum"
                    :min="0"
                    :max="9999"
                    size="small"
                    @change="(value) => handlewrongCountChange(scope.row.id, value)"
                  />
                </template>
              </el-table-column>
              <el-table-column prop="favouritenum" label="收藏本题数" width="150">
                <template #default="scope">
                  <el-input-number
                    v-model="scope.row.favouritenum"
                    :min="0"
                    :max="9999"
                    size="small"
                    @change="(value) => handlefavCountChange(scope.row.id, value)"
                  />
                </template>
              </el-table-column>
              <el-table-column prop="create_time" label="创建时间" width="150" />
              <el-table-column prop="status" label="等级状态" width="150">
                <template v-slot="scope">
                  <el-switch
                    v-model="scope.row.status"
                    :active-color="'#13ce66'"
                    :inactive-color="'#ff4949'"
                    active-text="启用"
                    inactive-text="禁用"
                    :active-value="1"
                    :inactive-value="2"
                    size="small"
                    @change="cstatuschange(scope.row.id, scope.row.status)"
                  ></el-switch>
                </template>
              </el-table-column>
              <el-table-column prop="description" label="备注" min-width="150" />

              <el-table-column label="更多操作" width="200" fixed="right">
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
            <!-- 等级分页组件 -->
            <el-pagination
              :current-page="levelPageNum"
              :page-size="levelPageSize"
              :total="levelTotal"
              @current-change="handleLevelPageChange"
              layout="total, prev, pager, next, jumper"
            ></el-pagination>
          </div>
        </el-tab-pane>
      </el-tabs>

      <el-dialog v-model="permissionDialogVisible" :title="mainActiveTab === 'role' ? '分配菜单权限' : '分配题库权限'" width="50%">
          <el-form :model="permissionform">
            <el-form-item :label="mainActiveTab === 'role' ? '选择菜单' : '选择题库'">
              <el-tree
                :data="treeData"
                show-checkbox
                node-key="id"
                :props="{
                  children: 'children',
                  label: 'category',
                }"
                :check-strictly="false"
                v-model="permissionform.category_ids"
                :default-checked-keys="permissionform.category_ids"
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
        :title="currentDialogType === 'role' ? '新增角色' : '新增等级'"
        width="500px"
        :close-on-click-modal="false"
      >
          <el-form :model="addForm" label-width="100px" :rules="rules" ref="addFormRef">
            <!-- 角色表单 -->
            <template v-if="currentDialogType === 'role'">
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
                  v-model="addForm.user_key"
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
                <el-input
                  v-model="addForm.description"
                  placeholder="请输入角色描述"
                ></el-input>
              </el-form-item>
            </template>

            <!-- 等级表单 -->
            <template v-else-if="currentDialogType === 'level'">
              <el-form-item
                label="等级名称"
                :rules="[{ required: true, message: '请输入等级名称', trigger: 'blur' }]"
              >
                <el-input
                  v-model="addForm.role_name"
                  placeholder="请输入等级名称"
                ></el-input>
              </el-form-item>

              <el-form-item label="等级标识">
                <el-input
                  v-model="addForm.user_key"
                  placeholder="请输入等级标识"
                ></el-input>
              </el-form-item>

              <el-form-item label="所需积分">
                <el-input-number
                  v-model="addForm.required_points"
                  :min="0"
                  :max="999999"
                  placeholder="请输入所需积分"
                ></el-input-number>
              </el-form-item>

              <el-form-item label="错题本可用">
                <el-radio-group v-model="addForm.wrong">
                  <el-radio :label="1">启用</el-radio>
                  <el-radio :label="2">禁用</el-radio>
                </el-radio-group>
              </el-form-item>

              <el-form-item label="收藏本可用">
                <el-radio-group v-model="addForm.favourite">
                  <el-radio :label="1">启用</el-radio>
                  <el-radio :label="2">禁用</el-radio>
                </el-radio-group>
              </el-form-item>

              <el-form-item label="AI解析次数">
                <el-input-number
                  v-model="addForm.count"
                  :min="0"
                  :max="9999"
                  placeholder="请输入AI解析次数"
                ></el-input-number>
              </el-form-item>

              <el-form-item label="错题本题数">
                <el-input-number
                  v-model="addForm.wrongnum"
                  :min="0"
                  :max="9999"
                  placeholder="请输入错题本题数"
                ></el-input-number>
              </el-form-item>

              <el-form-item label="收藏本题数">
                <el-input-number
                  v-model="addForm.favouritenum"
                  :min="0"
                  :max="9999"
                  placeholder="请输入收藏本题数"
                ></el-input-number>
              </el-form-item>

              <el-form-item label="等级状态">
                <el-radio-group v-model="addForm.status">
                  <el-radio :label="1">启用</el-radio>
                  <el-radio :label="2">禁用</el-radio>
                </el-radio-group>
              </el-form-item>
              <el-form-item label="等级描述">
                <el-input
                  v-model="addForm.description"
                  placeholder="请输入等级描述"
                ></el-input>
              </el-form-item>
            </template>
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
        :title="currentDialogType === 'role' ? '修改角色' : '修改等级'"
        width="500px"
        :close-on-click-modal="false"
      >
          <el-form :model="addForm" label-width="100px" :rules="rules" ref="addFormRef">
            <!-- 角色表单 -->
            <template v-if="currentDialogType === 'role'">
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
                  v-model="addForm.user_key"
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
                <el-input
                  v-model="addForm.description"
                  placeholder="请输入角色描述"
                ></el-input>
              </el-form-item>
            </template>

            <!-- 等级表单 -->
            <template v-else-if="currentDialogType === 'level'">
              <el-form-item
                label="等级名称"
                :rules="[{ required: true, message: '请输入等级名称', trigger: 'blur' }]"
              >
                <el-input
                  v-model="addForm.role_name"
                  placeholder="请输入等级名称"
                ></el-input>
              </el-form-item>

              <el-form-item label="等级标识" :rules="[{ required: true, message: '请输入等级标识', trigger: 'blur' }]">
                <el-input
                  v-model="addForm.user_key"
                  placeholder="请输入等级标识"
                ></el-input>
              </el-form-item>

              <el-form-item label="所需积分">
                <el-input-number
                  v-model="addForm.required_points"
                  :min="0"
                  :max="999999"
                  placeholder="请输入所需积分"
                ></el-input-number>
              </el-form-item>

              <el-form-item label="错题本可用">
                <el-radio-group v-model="addForm.wrong">
                  <el-radio :label="1">启用</el-radio>
                  <el-radio :label="2">禁用</el-radio>
                </el-radio-group>
              </el-form-item>

              <el-form-item label="收藏本可用">
                <el-radio-group v-model="addForm.favourite">
                  <el-radio :label="1">启用</el-radio>
                  <el-radio :label="2">禁用</el-radio>
                </el-radio-group>
              </el-form-item>

              <el-form-item label="AI解析次数">
                <el-input-number
                  v-model="addForm.count"
                  :min="0"
                  :max="9999"
                  placeholder="请输入AI解析次数"
                ></el-input-number>
              </el-form-item>

              <el-form-item label="错题本题数">
                <el-input-number
                  v-model="addForm.wrongnum"
                  :min="0"
                  :max="9999"
                  placeholder="请输入错题本题数"
                ></el-input-number>
              </el-form-item>

              <el-form-item label="收藏本题数">
                <el-input-number
                  v-model="addForm.favouritenum"
                  :min="0"
                  :max="9999"
                  placeholder="请输入收藏本题数"
                ></el-input-number>
              </el-form-item>

              <el-form-item label="等级状态">
                <el-radio-group v-model="addForm.status">
                  <el-radio :label="1">启用</el-radio>
                  <el-radio :label="2">禁用</el-radio>
                </el-radio-group>
              </el-form-item>
              <el-form-item label="等级描述">
                <el-input
                  v-model="addForm.description"
                  placeholder="请输入等级描述"
                ></el-input>
              </el-form-item>
            </template>
          </el-form>
          <template #footer>
            <span class="dialog-footer">
              <el-button @click="updateDialogVisible = false">取消</el-button>
              <el-button type="primary" @click="submitUpdateForm">确定</el-button>
            </span>
          </template>
      </el-dialog>

      <!-- CDK管理对话框 -->
      <el-dialog
        title="CDK管理"
        v-model="CDKDialogVisible"
        width="70%"
        :close-on-click-modal="false"
      >
          <el-row gutter="20">
            <!-- 左边生成部分 -->
            <el-col :span="8">
              <h3>生成CDK</h3>
              <el-form :model="generateForm" label-width="120px">
                <!-- 角色类型：只读 -->
                <el-form-item label="角色类型" required>
                  <el-input v-model="generateForm.role" disabled />
                </el-form-item>

                <el-form-item label="生成数量" required>
                  <el-input-number
                    v-model="generateForm.count"
                    :min="1"
                    :max="1000"
                    controls-position="right"
                  ></el-input-number>
                </el-form-item>

                <el-form-item label="有效期(天)" required>
                  <el-input-number
                    v-model="generateForm.expire_days"
                    :min="1"
                    :max="365"
                    controls-position="right"
                  ></el-input-number>
                  <div class="form-item-tip">CDK本身的过期时间</div>
                </el-form-item>

                <el-form-item label="激活期限(天)" required>
                  <el-input-number
                    v-model="generateForm.active_days"
                    :min="1"
                    :max="3650"
                    controls-position="right"
                  ></el-input-number>
                  <div class="form-item-tip">用户激活后角色的有效期</div>
                </el-form-item>

                <el-form-item>
                  <el-button type="primary" @click="handleGenerate">立即生成</el-button>
                </el-form-item>
              </el-form>
            </el-col>

            <!-- 右边CDK列表部分 -->
            <el-col :span="16">
              <el-form
                :model="searchFormCDK"
                :rules="rules"
                ref="generateFormRef"
                :inline="true"
                class="search-form"
              >
                <el-form-item label="CDK状态">
                  <el-select v-model="searchFormCDK.is_used" placeholder="请选择CDK状态">
                    <el-option label="未使用" :value="0" />
                    <el-option label="已使用" :value="1" />
                  </el-select>
                </el-form-item>
                <el-form-item label="开始时间">
                  <el-date-picker
                    v-model="searchFormCDK.beginTime"
                    placeholder="请输入开始时间"
                    :picker-options="pickerOptions"
                  />
                </el-form-item>
                <el-form-item label="结束时间">
                  <el-date-picker
                    v-model="searchFormCDK.endTime"
                    placeholder="请输入结束时间"
                    :picker-options="pickerOptions"
                  />
                </el-form-item>
                <el-form-item>
                  <el-button type="primary" @click="getCDKList">
                    <el-icon><Search /></el-icon>搜索
                  </el-button>
                  <el-button @click="resetcdksearch">
                    <el-icon><Refresh /></el-icon>重置
                  </el-button>
                </el-form-item>
              </el-form>

              <div class="list-header">
                <h3>
                  CDK列表 
                  <el-tag type="success">全部可用CDK数：{{ totalcdk }}</el-tag>
                  <el-tag type="info">当前筛选结果：{{ totalCDK }}</el-tag>
                </h3>
                <div class="export-buttons">
                  <el-button 
                    size="small" 
                    type="primary"
                    @click="exportCdks(searchFormCDK.role)"
                  >
                    <el-icon><Download /></el-icon>
                    导出可用CDK
                  </el-button>
                  
                  <el-button 
                    size="small" 
                    type="info"
                    @click="exportAllCdks(searchFormCDK.role)"
                  >
                    <el-icon><Download /></el-icon>
                    导出全部CDK
                  </el-button>
                </div>
              </div>

              <el-table :data="tableDataCDK" stripe row-key="code" style="width: 100%">
                <el-table-column prop="code" label="CDK" min-width="180" />
                <el-table-column prop="role" label="角色" min-width="120" />
                <el-table-column prop="is_used" label="是否使用" width="100">
                  <template #default="{ row }">
                    <el-tag
                      :type="row.is_used ? 'danger' : 'success'"
                      disable-transitions
                    >
                      {{ row.is_used ? "已使用" : "未使用" }}
                    </el-tag>
                  </template>
                </el-table-column>
                <el-table-column prop="active_days" label="激活期限" width="100">
                  <template #default="{ row }">
                    <el-tag type="info" size="small">
                      {{ row.active_days || 365 }}天
                    </el-tag>
                  </template>
                </el-table-column>
                <el-table-column prop="used_at" label="被使用时间" width="150" />
                <el-table-column prop="expired_at" label="CDK过期时间" width="150" />
                <el-table-column prop="created_at" label="创建时间" width="150" />
                <el-table-column prop="updated_at" label="更新时间" width="150" />
              </el-table>
              <!-- 修复后的CDK分页组件 -->
              <el-pagination
                :current-page="pageNum2"
                :page-size="pageSize"
                :total="totalCDK"
                @current-change="handlePageChangeCDK"
                layout="total, prev, pager, next, jumper"
              />
            </el-col>
          </el-row>

        <span slot="footer" class="dialog-footer">
          <el-button @click="CDKDialogVisible = false">关闭</el-button>
        </span>
      </el-dialog>

    </div>
  </el-container>
</template>

<script setup>
import { ref, onMounted, getCurrentInstance, computed, nextTick } from "vue";
import { Plus, Search, Refresh, ArrowDown, Download } from "@element-plus/icons-vue";
import { ElMessage, ElMessageBox, ElLoading } from "element-plus";
import * as XLSX from "xlsx";

const { proxy } = getCurrentInstance();
const tableRef = ref(null);
const addFormRef = ref(null);
const rolelist = ref([]);
const pageNum = ref(null); // 当前页数
const pageNum2 = ref(null); // CDK当前页数

const pageSize = ref(null); // 每页显示数量
const total = ref(null); // 角色总记录数
const totalCDK = ref(0); // CDK列表的总数（用于分页）
const totalcdk = ref(null); // 可用CDK总数

// 主选项卡相关
const mainActiveTab = ref("role"); // 主选项卡：role 或 level
const currentDialogType = ref("role"); // 当前对话框类型

// 角色相关数据
const roleTableData = ref([]);

// 等级相关数据
const levelTableData = ref([]);
const levelPageNum = ref(1);
const levelPageSize = ref(10);
const levelTotal = ref(0);
const levelSearchForm = ref({
  pageNum: "",
  pageSize: "",
  roleName: "",
  status: "",
  beginTime: "",
  endTime: "",
});

const CDKDialogVisible = ref(false);
const permissionDialogVisible = ref(false);
const addDialogVisible = ref(false);
const updateDialogVisible = ref(false);

const activeTab = ref("roleType");

const rules = {
  roleType: [{ required: true, message: "请选择角色类型" }],
  roleName: [{ required: true, message: "请输入角色名称" }],
};

const selectmenu = ref({});

const searchFormRef = ref();

const generateFormRef = ref();

const generateForm = ref({
  role: "",
  count: "",
  expire_days: "",
  active_days: 365, // 激活后有效期，默认365天
});
const searchForm = ref({
  pageNum: "",
  pageSize: "",
  roleName: "",
  status: "",
  beginTime: "",
  endTime: "",
});
const searchFormCDK = ref({
  pageNum: "",
  pageSize: "",
  role: "",
  is_used: "",
  beginTime: "",
  endTime: "",
});

const addForm = ref({
  description: "string",
  user_key: "string",
  role_name: "string",
  status: 0,
  required_points: 0,
  type: "role", // role 或 level
  wrong: 1, // 错题本可用性，默认启用
  favourite: 1, // 收藏本可用性，默认启用
  count: 3, // AI解析次数，默认3次
  wrongnum: 10, // 错题本题数，默认10题
  favouritenum: 10, // 收藏本题数，默认10题
});

// 计算属性：根据主选项卡过滤数据
const tableData = computed(() => {
  return mainActiveTab.value === "role" ? roleTableData.value : levelTableData.value;
});

const statuschange = ref({
  id: "",
  status: "",
});

const handlefavCountChange = async (userId, newCount) => {
  try {
    // 构造符合后端要求的参数格式
    const params = {
      id: userId,
      count: newCount,
    };

    const response = await proxy.$api.userroleupdatefavcount(params);

    if (response.code == 200) {
      ElMessage.success("收藏本数设置成功");
    } else {
      ElMessage.error(response.message || "设置失败");
    }
  } catch (error) {
    console.error("收藏本数设置失败:", error);
    ElMessage.error("网络错误，请稍后重试");
  }
};

const handlewrongCountChange = async (userId, newCount) => {
  try {
    // 构造符合后端要求的参数格式
    const params = {
      id: userId,
      count: newCount,
    };

    const response = await proxy.$api.userroleupdatewrongcount(params);

    if (response.code == 200) {
      ElMessage.success("错题本数设置成功");
    } else {
      ElMessage.error(response.message || "设置失败");
    }
  } catch (error) {
    console.error("错题本数设置失败:", error);
    ElMessage.error("网络错误，请稍后重试");
  }
};
const handleAICountChange = async (userId, newCount) => {
  try {
    // 构造符合后端要求的参数格式
    const params = {
      id: userId,
      count: newCount,
    };

    const response = await proxy.$api.userrolecountupdate(params);

    if (response.code == 200) {
      ElMessage.success("AI次数设置成功");
    } else {
      ElMessage.error(response.message || "设置失败");
    }
  } catch (error) {
    console.error("AI次数设置失败:", error);
    ElMessage.error("网络错误，请稍后重试");
  }
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

    const response = proxy.$api.userroleupdatestatus(params); // 确保接口路径正确

    // 处理接口返回的结果
    if (response.success) {
    } else {
    }
  } catch (error) {}
};
const cstatuswrongchange = (id, status) => {
  // 确保id和status被正确赋值
  statuschange.value.id = id;
  statuschange.value.status = status;

  // 调用API接口
  try {
    const params = {
      id: statuschange.value.id,
      status: statuschange.value.status,
    };

    const response = proxy.$api.userroleupdatewrongstatus(params); // 确保接口路径正确

    // 处理接口返回的结果
    if (response.success) {
    } else {
    }
  } catch (error) {}
};
const cstatusfavchange = (id, status) => {
  // 确保id和status被正确赋值
  statuschange.value.id = id;
  statuschange.value.status = status;

  // 调用API接口
  try {
    const params = {
      id: statuschange.value.id,
      status: statuschange.value.status,
    };

    const response = proxy.$api.userroleupdatefavstatus(params); // 确保接口路径正确

    // 处理接口返回的结果
    if (response.success) {
    } else {
    }
  } catch (error) {}
};


const tableDataCDK = ref([]);

const res = ref([]);
const getCategorylist = () => {
  proxy.$api
    .questionvolist()
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

// 修复后的getCDKList函数 - 解决分页和可用CDK数量问题
const getCDKList = async () => {
  try {
    // 1. 获取当前页面的CDK列表（用于显示）
    const res = await proxy.$api.getcdklist(searchFormCDK.value);
    
    tableDataCDK.value = res.data.list || [];
    pageNum2.value = res.data.pageNum;
    pageSize.value = res.data.pageSize;
    totalCDK.value = res.data.total !== undefined ? res.data.total : res.data.list.length;
    
    // 2. 额外获取全部数据来统计可用CDK总数
    const allCdkParams = {
      role: searchFormCDK.value.role,
      pageNum: 1,
      pageSize: 10000 // 获取所有数据
    };
    const allRes = await proxy.$api.getcdklist(allCdkParams);
    
    if (allRes.code === 200) {
      // 修复：计算真正可用的CDK数量（未使用且未过期）
      totalcdk.value = allRes.data.list.filter((cdk) => {
        const isNotUsed = !cdk.is_used; // 改为!cdk.is_used
        const isNotExpired = !cdk.expired_at || new Date(cdk.expired_at) > new Date();
        return isNotUsed && isNotExpired;
      }).length;
    }
    
    console.log('CDK数据:', tableDataCDK.value);
    console.log('CDK总数:', totalCDK.value);
    console.log('全部可用CDK数量:', totalcdk.value);
    
  } catch (err) {
    ElMessage.error("获取CDK列表失败");
    console.error("获取CDK列表失败:", err);
  }
};

const handleGenerate = async () => {
  try {
    const res = await proxy.$api.generatecdk(generateForm.value);
    if (res.code === 200) {
      ElMessage.success("CDK生成成功");
      await getCDKList(); // 重新加载CDK列表
    } else {
      ElMessage.error(res.message || "生成CDK失败");
    }
  } catch (err) {
    console.error("生成CDK失败:", err);
    ElMessage.error("生成CDK失败，请稍后重试");
  }
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

const permissionform = ref({
  id: "",
  category_ids: [],
});

// 提交权限
const submitPermission = () => {
  permissionform.value.category_ids = [...new Set(permissionform.value.category_ids)];

  proxy.$api.userroleassignpermissions(permissionform.value).then((res) => {
    if (res.code === 200) {
      const successMsg = mainActiveTab.value === 'role' ? '角色权限更新成功' : '等级权限更新成功';
      ElMessage.success(successMsg);
      permissionDialogVisible.value = false; // 关闭对话框
    } else {
      const errorMsg = mainActiveTab.value === 'role' ? '角色权限更新失败' : '等级权限更新失败';
      ElMessage.error(errorMsg);
    }
  });
};

// 修复后的导出功能 - 导出全部可用CDK
const exportCdks = async (user_key) => {
  try {
    // 显示加载提示
    const loading = ElLoading.service({
      lock: true,
      text: '正在获取全部CDK数据...',
      background: 'rgba(0, 0, 0, 0.7)'
    });

    // 1. 构造获取全部CDK的请求参数
    const allCdkParams = {
      role: user_key,
      pageNum: 1,
      pageSize: 10000, // 设置一个很大的页面大小来获取所有数据
    };

    // 2. 调用API获取全部CDK数据
    const response = await proxy.$api.getcdklist(allCdkParams);
    
    // 关闭加载提示
    loading.close();
    
    if (response.code !== 200) {
      throw new Error(response.message || '获取CDK数据失败');
    }

    const allCdkData = response.data.list || [];

    // 3. 过滤出可用CDK（未使用且未过期）
    const availableCdks = allCdkData.filter((cdk) => {
      const isNotUsed = !cdk.is_used;
      const isNotExpired = !cdk.expired_at || new Date(cdk.expired_at) > new Date();
      return isNotUsed && isNotExpired;
    });

    if (availableCdks.length === 0) {
      ElMessage.warning("没有可用的CDK可导出");
      return;
    }

    // 4. 准备Excel数据
    const excelData = availableCdks.map((cdk, index) => ({
      卡券码: cdk.code,
      "密码（无则不填）": cdk.password || ''
    }));

    // 5. 创建工作簿
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(excelData);

    // 6. 设置列宽
    ws["!cols"] = [
      { wch: 20 },  // 密码列宽
      { wch: 8 },  // 序号列宽
    ];

    // 7. 添加工作表
    XLSX.utils.book_append_sheet(wb, ws, "工作表1");

    // 8. 生成文件名（时间+user_key+数量）
    const now = new Date();
    const pad = (n) => n.toString().padStart(2, "0");

    // 生成人类可读时间格式：2025-06-11_14-05-30
    const timestamp = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(
      now.getDate()
    )}_${pad(now.getHours())}-${pad(now.getMinutes())}-${pad(now.getSeconds())}`;

    const fileName = `${timestamp}_${user_key}_可用CDK_${availableCdks.length}条.xlsx`;

    // 9. 导出文件
    XLSX.writeFile(wb, fileName);

    ElMessage.success(`导出成功！共导出 ${availableCdks.length} 条可用CDK`);

  } catch (error) {
    console.error("导出失败:", error);
    ElMessage.error("导出失败: " + error.message);
  }
};

// 导出全部CDK（包括已使用）的函数
const exportAllCdks = async (user_key) => {
  try {
    const loading = ElLoading.service({
      lock: true,
      text: '正在获取全部CDK数据...',
      background: 'rgba(0, 0, 0, 0.7)'
    });

    const allCdkParams = {
      role: user_key,
      pageNum: 1,
      pageSize: 10000,
    };

    const response = await proxy.$api.getcdklist(allCdkParams);
    loading.close();

    if (response.code !== 200) {
      throw new Error(response.message || '获取CDK数据失败');
    }

    const allCdkData = response.data.list || [];

    if (allCdkData.length === 0) {
      ElMessage.warning("没有CDK数据可导出");
      return;
    }

    const excelData = allCdkData.map((cdk, index) => ({
      卡券码: cdk.code,
      "密码（无则不填）": cdk.password || ''
    }));

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(excelData);

    ws["!cols"] = [
      { wch: 20 },  // 密码
      { wch: 8 },  // 序号
    ];

    XLSX.utils.book_append_sheet(wb, ws, "工作表1");

    const now = new Date();
    const pad = (n) => n.toString().padStart(2, "0");
    const timestamp = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(
      now.getDate()
    )}_${pad(now.getHours())}-${pad(now.getMinutes())}-${pad(now.getSeconds())}`;

    const fileName = `${timestamp}_${user_key}_全部CDK_${allCdkData.length}条.xlsx`;

    XLSX.writeFile(wb, fileName);

    ElMessage.success(`导出成功！共导出 ${allCdkData.length} 条CDK记录`);

  } catch (error) {
    console.error("导出失败:", error);
    ElMessage.error("导出失败: " + error.message);
  }
};

// 主选项卡切换处理
const handleMainTabChange = (tabName) => {
  mainActiveTab.value = tabName;
  if (tabName === "role") {
    usergetroleList();
  } else if (tabName === "level") {
    getLevelList();
  }
};

// 获取角色列表
const usergetroleList = () => {
  const params = {
    ...searchForm.value,
    type: "role" // 只获取角色类型的数据
  };
  proxy.$api
    .userrolelist(params)
    .then((res) => {
      roleTableData.value = res.data.list || [];
      pageNum.value = res.data.pageNum;
      pageSize.value = res.data.pageSize;
      total.value = res.data.total;
    })
    .catch((err) => {
      ElMessage.error("获取角色列表失败");
      console.error("获取角色列表失败:", err);
    });
};

// 获取等级列表
const getLevelList = () => {
  const params = {
    ...levelSearchForm.value,
    pageNum: levelPageNum.value,
    pageSize: levelPageSize.value,
    type: "level" // 只获取等级类型的数据
  };
  proxy.$api
    .userrolelist(params)
    .then((res) => {
      levelTableData.value = res.data.list || [];
      levelPageNum.value = res.data.pageNum;
      levelPageSize.value = res.data.pageSize;
      levelTotal.value = res.data.total;
    })
    .catch((err) => {
      ElMessage.error("获取等级列表失败");
      console.error("获取等级列表失败:", err);
    });
};

// 重置等级搜索
const resetLevelSearch = () => {
  levelSearchForm.value.roleName = "";
  levelSearchForm.value.status = "";
  levelSearchForm.value.beginTime = "";
  levelSearchForm.value.endTime = "";
  getLevelList();
};

// 等级分页处理
const handleLevelPageChange = (newPage) => {
  levelPageNum.value = newPage;
  getLevelList();
};

// 处理所需积分变化
const handleRequiredPointsChange = async (id, newPoints) => {
  try {
    const params = {
      id: id,
      required_points: newPoints,
    };

    const response = await proxy.$api.userroleupdate(params);

    if (response.code == 200) {
      ElMessage.success("所需积分设置成功");
    } else {
      ElMessage.error(response.message || "设置失败");
    }
  } catch (error) {
    console.error("所需积分设置失败:", error);
    ElMessage.error("网络错误，请稍后重试");
  }
};

const submitAddForm = () => {
  addFormRef.value.validate((valid) => {
    if (!valid) {
      return ElMessage.error("请填写完整的表单数据");
    }
    
    // 设置类型
    addForm.value.type = currentDialogType.value;
    
    console.log("请求数据:", addForm.value);
    proxy.$api
      .userroleadd(addForm.value)
      .then((res) => {
        const successMsg = currentDialogType.value === "role" ? "新增角色成功" : "新增等级成功";
        ElMessage.success(successMsg);
        addDialogVisible.value = false;
        
        // 根据类型刷新对应列表
        if (currentDialogType.value === "role") {
          usergetroleList();
        } else {
          getLevelList();
        }
      })
      .catch((err) => {
        console.log("请求失败:", err);
        const errorMsg = currentDialogType.value === "role" ? "新增角色失败" : "新增等级失败";
        ElMessage.error(errorMsg);
      });
  });
};

const submitUpdateForm = () => {
  addFormRef.value.validate((valid) => {
    if (!valid) {
      return ElMessage.error("请填写完整的表单数据");
    }
    
    // 设置类型
    addForm.value.type = currentDialogType.value;
    
    console.log("请求数据:", addForm.value);
    proxy.$api.userroleupdate(addForm.value)
      .then((res) => {
        const successMsg = currentDialogType.value === "role" ? "修改角色成功" : "修改等级成功";
        ElMessage.success(successMsg);
        updateDialogVisible.value = false;
        
        // 根据类型刷新对应列表
        if (currentDialogType.value === "role") {
          usergetroleList();
        } else {
          getLevelList();
        }
      })
      .catch((err) => {
        console.log("请求失败:", err);
        const errorMsg = currentDialogType.value === "role" ? "修改角色失败" : "修改等级失败";
        ElMessage.error(errorMsg);
      });
  });
};

const resetcdksearch = async () => {
  searchFormCDK.value.is_used = "";
  searchFormCDK.value.beginTime = "";
  searchFormCDK.value.endTime = "";
  await getCDKList();
};

const resetSearch = () => {
  searchForm.value.roleName = "";
  searchForm.value.status = "";
  searchForm.value.beginTime = "";
  searchForm.value.endTime = "";
  usergetroleList();
};

// 勾选变化的处理函数
const handleCheckChange = (node, checked) => {
  if (checked) {
    permissionform.value.category_ids.push(node.id);
  } else {
    const index = permissionform.value.category_ids.indexOf(node.id);
    if (index !== -1) {
      permissionform.value.category_ids.splice(index, 1);
    }
  }
};

// 显示权限分配对话框
const showPermission = (id) => {
  permissionform.value.id = id;
  permissionform.value.category_ids = []; // 清空之前的菜单权限
  console.log("调用 showPermission，准备获取菜单数据");
  console.log("当前权限form数据:", permissionform.value);
  getCategorylist(); // 调用获取菜单数据的方法
  getselect(id); // 调用获取菜单数据的方法
  console.log("现在的permissionform:", permissionform.value);
  nextTick(() => {
    console.log("treeData after update:", treeData);
    permissionDialogVisible.value = true; // 显示对话框
  });
};

// 显示等级权限分配对话框
const showLevelPermission = (id) => {
  permissionform.value.id = id;
  permissionform.value.category_ids = []; // 清空之前的题库权限
  console.log("调用 showLevelPermission，准备获取题库数据");
  console.log("当前权限form数据:", permissionform.value);
  getCategorylist(); // 调用获取题库数据的方法
  getselect(id); // 调用获取已分配的题库权限
  console.log("现在的permissionform:", permissionform.value);
  nextTick(() => {
    console.log("treeData after update:", treeData);
    permissionDialogVisible.value = true; // 显示对话框
  });
};

const showCDK = async (user_key) => {
  generateForm.value.role = user_key;
  searchFormCDK.value.role = user_key;
  await getCDKList();
  CDKDialogVisible.value = true; // 显示对话框
};

const showAddDialog = (type = "role") => {
  currentDialogType.value = type;
  // 重置表单数据
  addForm.value = {
    description: "",
    user_key: "",
    role_name: "",
    status: 1,
    required_points: 0,
    type: type,
  };
  addDialogVisible.value = true;
};

// 获取菜单列表数据
const getselect = async (id) => {
  try {
    // 调用接口获取已分配的菜单
    const response = await proxy.$api.userrolevoidlist({ id }); // 确保参数是对象

    console.log("接口返回的响应:", response);

    // 检查接口返回的 code 是否为 200
    if (response.code === 200) {
      // 如果接口返回的数据是有效的，直接赋值给 category_ids
      permissionform.value.category_ids = response.data; // response.data 是已选的菜单 ID 数组
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
  addForm.value = { ...role };
  // 根据数据的type字段或者当前主选项卡设置对话框类型
  currentDialogType.value = role.type || mainActiveTab.value;
  console.log("数据", addForm.value);
  updateDialogVisible.value = true;
};

onMounted(() => {
  // 根据当前选项卡加载对应数据
  if (mainActiveTab.value === "role") {
    usergetroleList();
  } else {
    getLevelList();
  }
  getCategorylist(); // 获取菜单列表
});

// 页码变化时触发的处理函数
const handlePageChange = (newPage) => {
  searchForm.value.pageNum = newPage;
  usergetroleList();
};

const handlePageChangeCDK = (newPage) => {
  searchFormCDK.value.pageNum = newPage;
  getCDKList();
};

const deleterole = (id) => {
  const isRole = mainActiveTab.value === "role";
  const itemType = isRole ? "角色" : "等级";
  
  // 弹出确认框
  ElMessageBox.confirm(`确定删除该${itemType}吗？`, `删除${itemType}`, {
    confirmButtonText: "删除",
    cancelButtonText: "取消",
    type: "warning",
  })
    .then(() => {
      // 用户确认删除，构造删除请求的结构体
      const deleteRequest = {
        id: id,
      };

      // 发送删除请求
      proxy.$api.userroledelete(deleteRequest).then((res) => {
        if (res.code == 200) {
          ElMessage.success(`${itemType}删除成功`);
          // 根据类型刷新对应列表
          if (isRole) {
            usergetroleList();
          } else {
            getLevelList();
          }
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
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: 30px;
  background-color: #fff;
  border-radius: 10px;
  min-height: calc(100vh - 60px);
  height: auto;
  overflow: hidden;
}

.role-layout {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 24px;
  overflow: hidden;
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

.form-item-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
  line-height: 1.4;
}
</style>
