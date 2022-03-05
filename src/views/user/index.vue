<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input v-model="listQuery.username" placeholder="请输入用户名" style="width: 200px;" class="filter-item" @keyup.enter.native="handleFilter" />
      <el-select v-model="listQuery.role_type" placeholder="角色类型" clearable style="width: 120px" class="filter-item">
        <el-option v-for="item in roleTypeSelectList" :key="item.key" :label="item.label" :value="item.key" />
      </el-select>
      <el-select v-model="listQuery.status" placeholder="状态" clearable style="width: 90px;margin-right: 30px" class="filter-item">
        <el-option v-for="item in statusSelectList" :key="item.key" :label="item.label" :value="item.key" />
      </el-select>
      <el-button v-waves class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">
        搜索
      </el-button>
      <el-button class="filter-item el-button--success" style="margin-left: 10px;" type="primary" icon="el-icon-edit" @click="handleCreate">
        新增
      </el-button>
      <el-popconfirm
        title="确定删除？"
        @onConfirm="handleSelectionDelete"
      >
        <el-button slot="reference" style="margin-left: 10px;margin-bottom:20px" type="primary" icon="el-icon-delete-solid" class="el-button--danger">
          删除
        </el-button>
      </el-popconfirm>
    </div>

    <el-table
      :key="tableKey"
      v-loading="listLoading"
      :data="list"
      border
      fit
      highlight-current-row
      style="width: 100%;"
      @sort-change="sortChange"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" align="center" />
      <el-table-column label="ID" prop="id" sortable="custom" align="center" width="80" :class-name="getSortClass('id')">
        <template slot-scope="{row}">
          <span>{{ row.id }}</span>
        </template>
      </el-table-column>
      <el-table-column label="用户名" width="300px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.username }}</span>
        </template>
      </el-table-column>
      <el-table-column label="角色类型" width="200px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.role_type === 1 ? '管理员' : '普通角色' }}</span>
        </template>
      </el-table-column>
      <el-table-column label="备注信息" align="center">
        <template slot-scope="{row}">
          <span>{{ row.remark }}</span>
        </template>
      </el-table-column>
      <el-table-column label="状态" class-name="status-col" width="100px" align="center">
        <template slot-scope="{row}">
          <el-tag :type="row.status | statusFilter">
            {{ row.status === 1 ? '启用' : '禁用' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="更新时间" align="center">
        <template slot-scope="{row}">
          <span>{{ row.updated_at }}</span>
        </template>
      </el-table-column>

      // 操作栏目
      <el-table-column label="操作" align="center" width="300px" class-name="small-padding fixed-width">
        <template slot-scope="{row,$index}">
          <el-button type="primary" size="mini" @click="handleUpdate(row)">
            编辑
          </el-button>
          <el-button v-if="row.status!==1" size="mini" type="success" @click="handleModifyStatus(row,1)">
            启用
          </el-button>
          <el-button v-if="row.status!==2" size="mini" type="warning" @click="handleModifyStatus(row,2)">
            禁用
          </el-button>
          <el-button size="mini" type="info" @click="handleResetPassword(row)">
            重置密码
          </el-button>
          <el-button size="mini" type="primary" @click="handleAuthApplication(row)">
            授权
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="getList" />

    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible" width="50%">
      <el-form ref="dataForm" :rules="rules" :model="temp" label-position="left" label-width="70px" style="width: 90%; margin-left:50px;">

        <el-form-item label="用户名称">
          <el-input v-model="temp.username" placeholder="请输入 用户名称" />
        </el-form-item>
        <el-form-item v-if="dialogStatus==='create'" label="用户密码">
          <el-input v-model="temp.password" placeholder="请输入 用户密码" />
        </el-form-item>
        <el-form-item label="角色类型">
          <el-select v-model="temp.role_type" class="filter-item" placeholder="请选择 角色类型">
            <el-option v-for="item in roleTypeSelectList" :key="item.key" :label="item.label" :value="item.key" />
          </el-select>
        </el-form-item>
        <el-form-item label="备注信息">
          <el-input v-model="temp.remark" :autosize="{ minRows: 4, maxRows: 6}" type="textarea" placeholder="请输入备注信息" />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="temp.status" class="filter-item" placeholder="请选择 状态">
            <el-option v-for="item in statusSelectList" :key="item.key" :label="item.label" :value="item.key" />
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">
          取消
        </el-button>
        <el-button type="primary" @click="dialogStatus==='create'?createData():updateData()">
          保存
        </el-button>
      </div>
    </el-dialog>

    <el-dialog title="重置密码" :visible.sync="dialogResetPasswordVisible" width="600px">
      <el-form ref="dataResetPasswordForm" :rules="rules" :model="tempResetPassword" label-position="left" label-width="70px" style="width: 90%; margin-left:30px;">

        <el-form-item label="重置密码">
          <el-input v-model="tempResetPassword.password" type="password" placeholder="请输入密码" />
        </el-form-item>
        <el-form-item label="确认密码">
          <el-input v-model="tempResetPassword.again_password" type="password" placeholder="请输入再次输入密码" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogResetPasswordVisible = false">
          取消
        </el-button>
        <el-button type="primary" @click="resetPasswordData()">
          保存
        </el-button>
      </div>
    </el-dialog>

    <el-dialog title="应用授权" :visible.sync="dialogAuthApplicationVisible" width="800px">
      <el-form ref="dataAuthApplicationForm" :rules="rules" :model="tempResetPassword" label-position="left" label-width="70px" style="width: 90%; margin-left:30px;">

        <el-form-item label="应用列表">
          <el-select v-model="tempAuthApplication.application_ids" style="width:100%" multiple placeholder="请选择应用">
            <el-option
              v-for="item in selectApplicationList"
              :key="item.id"
              :label="item.app_code"
              :value="item.id"
            />
          </el-select>
        </el-form-item>

      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogAuthApplicationVisible = false">
          取消
        </el-button>
        <el-button type="primary" @click="authApplicationData()">
          保存
        </el-button>
      </div>
    </el-dialog>

  </div>
</template>

<script>
import {
  getList,
  add,
  edit,
  switchStatus,
  toDelete,
  resetPassword,
  authApplication,
  getAuthApplication
} from '@/api/user'
import { getList as getApplicationList } from '@/api/application'
import waves from '@/directive/waves' // waves directive
import { parseTime } from '@/utils'
import Pagination from '@/components/Pagination' // secondary package based on el-pagination

const calendarTypeOptions = [
  { key: 'CN', display_name: 'China' },
  { key: 'US', display_name: 'USA' },
  { key: 'JP', display_name: 'Japan' },
  { key: 'EU', display_name: 'Eurozone' }
]

// arr to obj, such as { CN : "China", US : "USA" }
const calendarTypeKeyValue = calendarTypeOptions.reduce((acc, cur) => {
  acc[cur.key] = cur.display_name
  return acc
}, {})

export default {
  name: 'ComplexTable',
  components: { Pagination },
  directives: { waves },
  filters: {
    statusFilter(status) {
      const statusMap = {
        0: 'info',
        1: 'success',
        2: 'danger'
      }
      return statusMap[status]
    },
    typeFilter(type) {
      return calendarTypeKeyValue[type]
    }
  },
  props: {
    width: {
      type: String,
      default: '80%'
    }
  },
  data() {
    return {
      tableKey: 0,
      list: null,
      total: 0,
      listLoading: false,
      listQuery: {
        page: 1,
        limit: 20,
        username: undefined,
        role_type: undefined,
        status: undefined
      },
      listQueryByApplication: {
        page: 1,
        limit: 100000
      },
      selectApplicationList: [],
      multipleSelection: [],
      importanceOptions: [1, 2, 3],
      calendarTypeOptions,
      sortOptions: [{ label: 'ID Ascending', key: '+id' }, { label: 'ID Descending', key: '-id' }],
      roleTypeSelectList: [{ label: '管理员', key: 1 }, { label: '普通角色', key: 2 }],
      statusSelectList: [{ label: '启用', key: 1 }, { label: '禁用', key: 2 }],
      modeSelectList: [{ label: '守护进程', key: 1 }, { label: '定时执行', key: 2 }],
      scheduleTypeSelectList: [{ label: '单机运行', key: 1 }, { label: '空闲执行', key: 2 }, { label: '分布式', key: 3 }],
      showReviewer: false,
      temp: {
        id: undefined,
        username: '',
        password: '',
        role_type: 2,
        status: 1,
        remark: ''
      },
      tempResetPassword: {
        id: undefined,
        password: '',
        again_password: ''
      },
      tempAuthApplication: {
        id: undefined,
        application_ids: []
      },
      dialogFormVisible: false,
      dialogResetPasswordVisible: false,
      dialogAuthApplicationVisible: false,
      dialogStatus: '',
      textMap: {
        update: '编辑',
        create: '新增'
      },
      dialogPvVisible: false,
      pvData: [],
      rules: {
        name: [{ required: true, message: '名称 必须', trigger: 'blur' }],
        mode: [{ required: true, message: '任务类型 必须', trigger: 'blur' }]
      },
      downloadLoading: false
    }
  },
  created() {
    this.getList()
    this.initSelectApplicationList()
  },
  methods: {
    getList() {
      getList(this.listQuery).then(response => {
        this.list = response.data.list
        this.total = response.data.count
        // Just to simulate the time of the request
        setTimeout(() => {
          this.listLoading = false
        }, 1.5 * 1000)
      })
    },
    initSelectApplicationList() {
      getApplicationList(this.listQueryByApplication).then(response => {
        this.selectApplicationList = response.data.list
      })
    },
    handleFilter() {
      this.listQuery.page = 1
      this.getList()
    },
    handleModifyStatus(row, status) {
      switchStatus({ ids: [row.id], status: status }).then(() => {
        this.$message({
          message: '操作Success',
          type: 'success'
        })
        row.status = status
      })
    },
    sortChange(data) {
      const { prop, order } = data
      if (prop === 'id') {
        this.sortByID(order)
      }
    },
    sortByID(order) {
      if (order === 'ascending') {
        this.listQuery.sort = '+id'
      } else {
        this.listQuery.sort = '-id'
      }
      this.handleFilter()
    },
    resetTemp() {
      this.temp = {
        id: undefined,
        username: '',
        password: '',
        role_type: 2,
        status: 1,
        remark: ''
      }
    },
    handleCreate() {
      this.resetTemp()
      this.dialogStatus = 'create'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    createData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          if (this.temp.mode === 1) {
            this.temp.cron_formula = ''
            this.temp.cron_time_out = 0
          }
          add(this.temp).then(() => {
            this.getList()
            this.dialogFormVisible = false
            this.$notify({
              title: 'Success',
              message: 'Created Successfully',
              type: 'success',
              duration: 2000
            })
          })
        }
      })
    },
    resetPasswordData() {
      this.$refs['dataResetPasswordForm'].validate((valid) => {
        if (valid) {
          resetPassword(this.tempResetPassword).then(() => {
            this.dialogResetPasswordVisible = false
            this.tempResetPassword.again_password = ''
            this.tempResetPassword.password = ''
            this.$notify({
              title: 'Success',
              message: 'Reset Password Successfully',
              type: 'success',
              duration: 2000
            })
          })
        }
      })
    },
    authApplicationData() {
      this.$refs['dataAuthApplicationForm'].validate((valid) => {
        if (valid) {
          authApplication(this.tempAuthApplication).then(() => {
            this.dialogAuthApplicationVisible = false
            this.tempAuthApplication.application_ids = []
            this.$notify({
              title: 'Success',
              message: 'Auth Application Successfully',
              type: 'success',
              duration: 2000
            })
          })
        }
      })
    },
    handleUpdate(row) {
      this.temp = Object.assign({}, row) // copy obj
      this.temp.timestamp = new Date(this.temp.timestamp)
      this.dialogStatus = 'update'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    handleResetPassword(row) {
      this.tempResetPassword.id = row.id // copy obj
      this.dialogResetPasswordVisible = true
      this.$nextTick(() => {
        this.$refs['dataResetPasswordForm'].clearValidate()
      })
    },
    handleAuthApplication(row) {
      this.tempAuthApplication.id = row.id // copy obj
      this.dialogAuthApplicationVisible = true
      this.tempAuthApplication.application_ids = []
      // 初始化已授权的应用
      getAuthApplication({ id: row.id }).then(response => {
        const that = this
        const list = response.data.list
        if (list.length > 0) {
          list.forEach((item, index) => {
            that.tempAuthApplication.application_ids.push(item.app_id)
          })
        }
      })

      this.$nextTick(() => {
        this.$refs['dataAuthApplicationForm'].clearValidate()
      })
    },
    updateData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          const tempData = Object.assign({}, this.temp)
          tempData.timestamp = +new Date(tempData.timestamp) // change Thu Nov 30 2017 16:41:05 GMT+0800 (CST) to 1512031311464
          edit(tempData).then(() => {
            const index = this.list.findIndex(v => v.id === this.temp.id)
            this.list.splice(index, 1, this.temp)
            this.dialogFormVisible = false
            this.getList()
            this.$notify({
              title: 'Success',
              message: 'Update Successfully',
              type: 'success',
              duration: 2000
            })
          })
        }
      })
    },
    handleDelete(row, index) {
      toDelete({ ids: [row.id] }).then(() => {
        this.$notify({
          title: 'Success',
          message: 'Delete Successfully',
          type: 'success',
          duration: 2000
        })
        this.list.splice(index, 1)
      })
    },
    handleSelectionChange(val) {
      this.multipleSelection = val
    },
    handleSelectionDelete() {
      if (this.multipleSelection.length) {
        const ids = []
        this.multipleSelection.forEach((row, index) => {
          ids.push(row.id)
        })
        toDelete({ ids: ids }).then(() => {
          this.$notify({
            title: 'Success',
            message: 'Delete Successfully',
            type: 'success',
            duration: 2000
          })
          this.getList()
        })
      } else {
        this.$notify({
          title: 'Error',
          message: 'Delete Error, Ids is null',
          type: 'error',
          duration: 2000
        })
      }
    },
    formatJson(filterVal) {
      return this.list.map(v => filterVal.map(j => {
        if (j === 'timestamp') {
          return parseTime(v[j])
        } else {
          return v[j]
        }
      }))
    },
    getSortClass: function(key) {
      const sort = this.listQuery.sort
      return sort === `+${key}` ? 'ascending' : 'descending'
    }
  }
}
</script>
