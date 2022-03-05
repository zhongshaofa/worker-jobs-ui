<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input v-model="listQuery.app_name" placeholder="请输入应用名称" style="width: 200px;" class="filter-item" @keyup.enter.native="handleFilter" />
      <el-input v-model="listQuery.app_code" placeholder="请输入应用编码" style="width: 200px;" class="filter-item" @keyup.enter.native="handleFilter" />
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
      <el-table-column label="应用名称" width="300px" align="center">
        <template slot-scope="{row}">
          <p style="margin: 5px">
            <span class="application-info-code" @click="jumpTask(row)">{{ row.app_code }}</span>
            <el-tooltip class="item" effect="dark" content="点击复制应用编码" placement="right">
              <i class="el-icon-copy-document copy-app-code" @click="doCopy(row)" />
            </el-tooltip>
          </p>
          <span class="application-info-name">{{ row.app_name }}</span>
        </template>
      </el-table-column>
      <el-table-column label="应用简介" align="center">
        <template slot-scope="{row}">
          <span>{{ row.introduction }}</span>
        </template>
      </el-table-column>
      <el-table-column label="状态" class-name="status-col" width="100px" align="center">
        <template slot-scope="{row}">
          <el-tag :type="row.status | statusFilter">
            {{ row.status === 1 ? '启用' : '禁用' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="更新时间" width="200px" align="center">
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
          <el-button v-if="row.status!==2" size="mini" @click="handleModifyStatus(row,2)">
            禁用
          </el-button>
          <el-button size="mini" type="primary" @click="handleAuthClient(row)">
            绑定client
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="getList" />

    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
      <el-form ref="dataForm" :rules="rules" :model="temp" label-position="left" label-width="70px" style="width: 400px; margin-left:50px;">
        <el-form-item label="应用编码">
          <el-input v-model="temp.app_code" />
        </el-form-item>
        <el-form-item label="应用名称">
          <el-input v-model="temp.app_name" />
        </el-form-item>
        <el-form-item label="应用简介">
          <el-input v-model="temp.introduction" :autosize="{ minRows: 4, maxRows: 6}" type="textarea" placeholder="Please input" />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="temp.status" class="filter-item" placeholder="Please select">
            <el-option v-for="item in statusSelectList" :key="item.key" :label="item.label" :value="item.key" />
          </el-select>
        </el-form-item>
        <el-form-item label="备注信息">
          <el-input v-model="temp.remark" :autosize="{ minRows: 4, maxRows: 6}" type="textarea" placeholder="Please input" />
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

    <el-dialog title="client授权" :visible.sync="dialogAuthClientVisible" width="800px">
      <el-form ref="dataAuthClientForm" :rules="rules" :model="tempAuthClient" label-position="left" label-width="100px" style="width: 90%; margin-left:30px;">

        <el-form-item label="client列表">
          <el-select v-model="tempAuthClient.client_ids" style="width:100%" multiple filterable placeholder="请选择应用">
            <el-option
              v-for="item in selectClientList"
              :key="item.id"
              :label="item.client_code"
              :value="item.id"
            />
          </el-select>
        </el-form-item>

      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogAuthClientVisible = false">
          取消
        </el-button>
        <el-button type="primary" @click="authClientData()">
          保存
        </el-button>
      </div>
    </el-dialog>

    <el-dialog :visible.sync="dialogPvVisible" title="Reading statistics">
      <el-table :data="pvData" border fit highlight-current-row style="width: 100%">
        <el-table-column prop="key" label="Channel" />
        <el-table-column prop="pv" label="Pv" />
      </el-table>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="dialogPvVisible = false">Confirm</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { getList, add, edit, switchStatus, toDelete, clientAuth, getClientList } from '@/api/application'
import waves from '@/directive/waves' // waves directive
import { parseTime } from '@/utils'
import Pagination from '@/components/Pagination'
import { getList as getSelectClientList } from '@/api/client' // secondary package based on el-pagination

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
  data() {
    return {
      tableKey: 0,
      list: null,
      total: 0,
      listLoading: false,
      listQuery: {
        page: 1,
        limit: 20,
        app_name: undefined,
        app_code: undefined,
        status: undefined
      },
      listQueryByClient: {
        page: 1,
        limit: 100000
      },
      importanceOptions: [1, 2, 3],
      multipleSelection: [],
      calendarTypeOptions,
      sortOptions: [{ label: 'ID Ascending', key: '+id' }, { label: 'ID Descending', key: '-id' }],
      statusSelectList: [{ label: '启用', key: 1 }, { label: '禁用', key: 2 }],
      selectClientList: [],
      showReviewer: false,
      temp: {
        id: undefined,
        remark: '',
        app_code: '',
        app_name: '',
        introduction: '',
        status: 1
      },
      tempAuthClient: {
        id: undefined,
        client_ids: []
      },
      dialogFormVisible: false,
      dialogAuthClientVisible: false,
      dialogStatus: '',
      textMap: {
        update: '编辑',
        create: '新增'
      },
      dialogPvVisible: false,
      pvData: [],
      rules: {
        app_name: [{ required: true, message: '应用名称 必须', trigger: 'change' }],
        app_code: [{ required: true, message: '应用编码 必须', trigger: 'change' }],
        introduction: [{ required: true, message: '简介 必须', trigger: 'blur' }],
        status: [{ required: true, message: '状态 必须', trigger: 'blur' }]
      },
      downloadLoading: false
    }
  },
  created() {
    this.getList()
    this.initSelectClientList()
  },
  methods: {
    getList() {
      getList(this.listQuery).then(response => {
        console.log(response.data.list)
        this.list = response.data.list
        this.total = response.data.count

        console.log(this)

        // Just to simulate the time of the request
        setTimeout(() => {
          this.listLoading = false
        }, 1.5 * 1000)
      })
    },
    initSelectClientList() {
      getSelectClientList(this.listQueryByClient).then(response => {
        this.selectClientList = response.data.list
      })
    },
    handleFilter() {
      this.listQuery.page = 1
      this.getList()
    },
    handleAuthClient(row) {
      this.tempAuthClient.id = row.id // copy obj
      this.dialogAuthClientVisible = true
      this.tempAuthClient.client_ids = []
      // 初始化已授权的应用
      getClientList({ id: row.id }).then(response => {
        const that = this
        const list = response.data.list
        if (list.length > 0) {
          list.forEach((item, index) => {
            that.tempAuthClient.client_ids.push(item.client_id)
          })
        }
      })

      this.$nextTick(() => {
        this.$refs['dataAuthClientForm'].clearValidate()
      })
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
        remark: '',
        app_code: '',
        app_name: '',
        introduction: '',
        status: 1
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
    handleUpdate(row) {
      this.temp = Object.assign({}, row) // copy obj
      this.temp.timestamp = new Date(this.temp.timestamp)
      this.dialogStatus = 'update'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
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
    formatJson(filterVal) {
      return this.list.map(v => filterVal.map(j => {
        if (j === 'timestamp') {
          return parseTime(v[j])
        } else {
          return v[j]
        }
      }))
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
    handleSelectionChange(val) {
      this.multipleSelection = val
    },
    jumpTask(row) {
      this.$router.push({
        path: '/taskList', query: {
          app_id: row.id,
          app_name: row.app_name,
          app_code: row.app_code
        }
      })
    },
    doCopy: function(row) {
      const that = this
      this.$copyText(row.app_code).then(function(e) {
        that.$notify({
          title: 'Success',
          message: '已成功复制至粘贴板',
          type: 'success',
          duration: 2000
        })
      }, function(e) {
        that.$notify({
          title: 'Error',
          message: '复制失败，请手动复制',
          type: 'error',
          duration: 2000
        })
      })
    },
    authClientData() {
      this.$refs['dataAuthClientForm'].validate((valid) => {
        if (valid) {
          clientAuth(this.tempAuthClient).then(() => {
            this.dialogAuthClientVisible = false
            this.tempAuthClient.client_ids = []
            this.$notify({
              title: 'Success',
              message: 'Bind Client Successfully',
              type: 'success',
              duration: 2000
            })
          })
        }
      })
    },
    getSortClass: function(key) {
      const sort = this.listQuery.sort
      return sort === `+${key}` ? 'ascending' : 'descending'
    }
  }
}
</script>

<style lang="scss" scoped>
.application-info-code{
  font-size: 20px;
  color: #3f9eff;
  margin: 5px;
}
.application-info-name{
  color: #8b9cad;
}
.copy-app-code{
  color: #9cabc1;
}
</style>
