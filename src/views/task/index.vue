<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input v-model="listQuery.name" placeholder="请输入任务名称" style="width: 200px;" class="filter-item" @keyup.enter.native="handleFilter" />
      <el-input v-model="listQuery.manager" placeholder="请输入负责人" style="width: 200px;" class="filter-item" @keyup.enter.native="handleFilter" />
      <el-select v-model="listQuery.status" placeholder="状态" clearable style="width: 90px;margin-right: 30px" class="filter-item">
        <el-option v-for="item in statusSelectList" :key="item.key" :label="item.label" :value="item.key" />
      </el-select>
      <el-button v-waves class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">
        搜索
      </el-button>
      <el-button class="filter-item el-button--success" style="margin-left: 10px;" type="primary" icon="el-icon-edit" @click="handleCreate">
        新增
      </el-button>
      <el-button style="margin-bottom:20px" type="primary" icon="el-icon-delete-solid" class="el-button--danger" @click="handleSelectionDelete">
        删除
      </el-button>
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
      <el-table-column label="任务名称" width="200px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.name }}</span>
        </template>
      </el-table-column>
      <el-table-column label="任务类型" width="200px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.mode === 1 ? '守护进程' : '定时执行' }}</span>
        </template>
      </el-table-column>
      <el-table-column label="cron表达式" width="300px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.cron_formula }}</span>
        </template>
      </el-table-column>
      <el-table-column label="负责人" width="200px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.manager }}</span>
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
          <el-button size="mini" type="danger" @click="handleDelete(row,$index)">
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="getList" />

    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible" width="55%">
      <el-form ref="dataForm" :rules="rules" :model="temp" label-position="left" label-width="70px" style="width: 90%; margin-left:50px;">
        <el-row type="flex">
          <el-col :span="12">
            <el-form-item label="任务名称">
              <el-input v-model="temp.name" placeholder="请输入 任务名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12" style="margin-left: 30px;">
            <el-form-item label="负责人">
              <el-input v-model="temp.manager" placeholder="请输入 负责人" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row type="flex">
          <el-col :span="12">
            <el-form-item label="任务类型">
              <el-select v-model="temp.mode" class="filter-item" placeholder="请选择 任务类型">
                <el-option v-for="item in modeSelectList" :key="item.key" :label="item.label" :value="item.key" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12" style="margin-left: 30px;">
            <el-form-item label="调度类型">
              <el-select v-model="temp.schedule_type" class="filter-item" placeholder="请选择 调度类型">
                <el-option v-for="item in scheduleTypeSelectList" :key="item.key" :label="item.label" :value="item.key" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="执行目录">
          <el-input v-model="temp.directory" placeholder="请输入 执行目录" />
        </el-form-item>
        <el-form-item label="执行命令">
          <el-input v-model="temp.command" placeholder="请输入 执行命令" />
        </el-form-item>

        <el-row v-if="temp.mode===2" type="flex">
          <el-col :span="12">
            <el-form-item label="Cron">
              <el-input v-model="temp.cron_formula" />
              <el-button type="primary" @click="showDialog">选择</el-button>
            </el-form-item>
          </el-col>
          <el-col :span="12" style="margin-left: 30px;">
            <el-form-item label="超时时间">
              <el-input v-model="temp.cron_time_out" placeholder="请输入 超时时间" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="备注信息">
          <el-input v-model="temp.remark" :autosize="{ minRows: 4, maxRows: 6}" type="textarea" placeholder="请输入备注信息" />
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

    <el-dialog title="生成 cron" :visible.sync="showCron">
      <vcrontab :expression="expression" @hide="showCron=false" @fill="crontabFill" />
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
import { getList, add, edit, switchStatus, toDelete } from '@/api/task'
import waves from '@/directive/waves' // waves directive
import { parseTime } from '@/utils'
import Pagination from '@/components/Pagination' // secondary package based on el-pagination
import vcrontab from 'vcrontab'

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
  components: { Pagination, vcrontab },
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
      expression: '',
      showCron: false,
      tableKey: 0,
      list: null,
      total: 0,
      listLoading: true,
      listQuery: {
        page: 1,
        limit: 20,
        app_id: 1,
        name: undefined,
        manager: undefined,
        status: undefined
      },
      multipleSelection: [],
      importanceOptions: [1, 2, 3],
      calendarTypeOptions,
      sortOptions: [{ label: 'ID Ascending', key: '+id' }, { label: 'ID Descending', key: '-id' }],
      statusSelectList: [{ label: '启用', key: 1 }, { label: '禁用', key: 2 }],
      modeSelectList: [{ label: '守护进程', key: 1 }, { label: '定时执行', key: 2 }],
      scheduleTypeSelectList: [{ label: '单机运行', key: 1 }, { label: '空闲执行', key: 2 }, { label: '分布式', key: 3 }],
      showReviewer: false,
      temp: {
        id: undefined,
        remark: '',
        app_id: 1,
        manager: '',
        name: '',
        mode: 1,
        cron_time_out: 0,
        cron_formula: '',
        schedule_type: 1,
        directory: '',
        command: ''
      },
      dialogFormVisible: false,
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
    if (this.$route.query.app_id !== undefined) {
      this.listQuery.app_id = this.$route.query.app_id
    }
    this.getList()
  },
  methods: {
    getList() {
      this.listLoading = true
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
        remark: '',
        app_id: 1,
        manager: '',
        name: '',
        mode: 1,
        cron_time_out: 0,
        cron_formula: '',
        schedule_type: 1,
        directory: '',
        command: ''
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
    },
    crontabFill(value) {
      // 确定后回传的值
      this.temp.cron_formula = value
    },
    showDialog() {
      this.expression = this.temp.cron_formula
      // 传入的 cron 表达式，可以反解析到 UI 上
      this.showCron = true
    }
  }
}
</script>
