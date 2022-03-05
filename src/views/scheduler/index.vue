<template>
  <div class="app-container">
    <div class="el-page-header" style="margin-bottom: 20px">
      <div class="el-page-header__left" @click="goBack"><i class="el-icon-back" />
        <div class="el-page-header__title"><el-tag type="info" class="back-tag">返回</el-tag></div>
      </div>
      <div class="el-page-header__content"><el-tag style="margin-right: 15px">{{ app_code }} / {{ app_name }}</el-tag>  <el-tag type="success">{{ task_name }}</el-tag></div>
    </div>
    <div class="filter-container">
      <el-select v-model="listQuery.scheduler_status" placeholder="选择状态" clearable style="width: 200px;margin-right: 30px;margin-bottom: 20px" class="filter-item">
        <el-option v-for="item in schedulerStatusSelectList" :key="item.key" :label="item.label" :value="item.key" />
      </el-select>
      <el-button v-waves class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">
        搜索
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
      <el-table-column label="ID" prop="id" sortable="custom" align="center" width="80" :class-name="getSortClass('id')">
        <template slot-scope="{row}">
          <span>{{ row.task_schedule.id }}</span>
        </template>
      </el-table-column>
      <el-table-column label="任务ID" width="200px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.task_schedule.task_id }}</span>
        </template>
      </el-table-column>
      <el-table-column label="调度client数量" width="200px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.client_list.length }}</span>
        </template>
      </el-table-column>
      <el-table-column label="调度时间" align="center">
        <template slot-scope="{row}">
          <span>{{ row.task_schedule.schedule_time }}</span>
        </template>
      </el-table-column>
      <el-table-column label="调度状态" class-name="status-col" width="150px" align="center">
        <template slot-scope="{row}">
          <el-tag :type="row.task_schedule.schedule_status | statusFilter">
            {{ getStatusTitle(row.task_schedule.schedule_status) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="更新时间" align="center">
        <template slot-scope="{row}">
          <span>{{ row.task_schedule.updated_at }}</span>
        </template>
      </el-table-column>

      // 操作栏目
      <el-table-column label="操作" align="center" width="200px" class-name="small-padding fixed-width">
        <template slot-scope="{row,$index}">
          <el-button type="primary" size="mini" @click="handleUpdate(row)">
            编辑
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="getList" />

    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible" width="50%">
      45252
    </el-dialog>

  </div>
</template>

<script>
import { getList } from '@/api/scheduler'
import waves from '@/directive/waves' // waves directive
import Pagination from '@/components/Pagination' // secondary package based on el-pagination

export default {
  name: 'ComplexTable',
  components: { Pagination },
  directives: { waves },
  filters: {
    statusFilter(status) {
      const statusMap = {
        0: 'danger',
        1: 'info',
        2: 'info',
        3: 'success',
        99: 'danger'
      }
      return statusMap[status]
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
        task_id: undefined,
        scheduler_status: undefined
      },
      task_name: undefined,
      app_id: undefined,
      app_name: undefined,
      app_code: undefined,
      multipleSelection: [],
      importanceOptions: [1, 2, 3],
      sortOptions: [{ label: 'ID Ascending', key: '+id' }, { label: 'ID Descending', key: '-id' }],
      schedulerStatusSelectList: [
        { label: '失效', key: 0 },
        { label: '待执行', key: 1 },
        { label: '执行中', key: 2 },
        { label: '执行成功', key: 3 },
        { label: '执行失败', key: 99 }
      ],
      showReviewer: false,
      temp: {
        id: undefined,
        username: '',
        password: '',
        role_type: 2,
        status: 1,
        remark: ''
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
    if (this.$route.query.task_id !== undefined) {
      this.listQuery.task_id = parseInt(this.$route.query.task_id)
      this.task_name = this.$route.query.task_name
      this.app_id = parseInt(this.$route.query.app_id)
      this.app_name = this.$route.query.app_name
      this.app_code = this.$route.query.app_code
    }
    this.getList()
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
    handleUpdate(row) {
      this.temp = Object.assign({}, row) // copy obj
      this.temp.timestamp = new Date(this.temp.timestamp)
      this.dialogStatus = 'update'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    handleSelectionChange(val) {
      this.multipleSelection = val
    },
    getStatusTitle(val) {
      let title = ''
      this.schedulerStatusSelectList.forEach((item, index) => {
        if (val === item.key) {
          title = item.label
          return title
        }
      })
      return title
    },
    goBack() {
      this.$router.push({
        path: '/taskList', query: {
          app_id: this.app_id,
          app_name: this.app_name,
          app_code: this.app_code
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
