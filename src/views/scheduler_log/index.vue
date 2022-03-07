<template>
  <div class="app-container">
    <div class="el-page-header" style="margin-bottom: 20px">
      <div class="el-page-header__left" @click="goBack"><i class="el-icon-back" />
        <div class="el-page-header__title"><el-tag type="info" class="back-tag">返回</el-tag></div>
      </div>
      <div class="el-page-header__content"><el-tag style="margin-right: 15px">{{ nav_info.app.app_code }} / {{ nav_info.app.app_name }}</el-tag>  <el-tag type="success" style="margin-right: 15px">{{ nav_info.task.task_name }} / {{ listQuery.task_id }}</el-tag>  <el-tag type="warning">调度ID：{{ listQuery.schedule_id }}</el-tag></div>
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
          <span>{{ row.id }}</span>
        </template>
      </el-table-column>
      <el-table-column label="任务ID" width="200px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.task_id }}</span>
        </template>
      </el-table-column>
      <el-table-column label="调度ID" width="200px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.schedule_id }}</span>
        </template>
      </el-table-column>
      <el-table-column label="clientID" width="200px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.client_id }}</span>
        </template>
      </el-table-column>
      <el-table-column label="client信息" align="center">
        <template slot-scope="{row}">
          <p style="margin: 5px">
            <span class="client-info-code" >{{ row.client.client_code }}</span>
            <el-tooltip class="item" effect="dark" content="点击复制client编码" placement="right">
              <i class="el-icon-copy-document copy-client-code" @click="doCopy(row)" />
            </el-tooltip>
          </p>
          <span class="client-info-name">{{ row.client.client_name }}</span>
        </template>
      </el-table-column>
      <el-table-column label="日志目录" align="center">
        <template slot-scope="{row}">
          <span>{{ row.log_path }}</span>
        </template>
      </el-table-column>
      <el-table-column label="更新时间" align="center">
        <template slot-scope="{row}">
          <span>{{ row.updated_at }}</span>
        </template>
      </el-table-column>

      // 操作栏目
      <el-table-column label="操作" align="center" width="200px" class-name="small-padding fixed-width">
        <template slot-scope="{row,$index}">
          <el-button type="primary" size="mini" @click="showConsoleLog(row)">
            查看Console日志
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="getList" />

    <el-dialog title="Console日志" :visible.sync="dialogConsoleVisible" fullscreen>
      <el-input v-model="temp.console_log" rows="35" type="textarea" placeholder="暂无日志信息" />
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogConsoleVisible = false">
          关闭
        </el-button>
      </div>
    </el-dialog>

  </div>
</template>

<script>
import { getList, readConsoleLog } from '@/api/scheduler_log'
import waves from '@/directive/waves' // waves directive
import Pagination from '@/components/Pagination'
import { detail as getApplicationDetail } from '@/api/application'
import { detail as getTaskDetail } from '@/api/task'

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
      intervalId: null,
      tableKey: 0,
      list: null,
      total: 0,
      listLoading: false,
      listQuery: {
        page: 1,
        limit: 20,
        task_id: undefined,
        client_id: undefined,
        schedule_id: undefined
      },
      nav_info: {
        task: {
          task_name: undefined
        },
        app: {
          app_id: undefined,
          app_name: undefined,
          app_code: undefined,
          introduction: undefined
        }
      },
      readLogQuery: {
        id: undefined,
        limit: 500,
        start_line: 0
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
        console_log: ''
      },
      dialogConsoleVisible: false,
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
    if (this.$route.query.schedule_id !== undefined) {
      this.listQuery.schedule_id = parseInt(this.$route.query.schedule_id)
    }
    if (this.$route.query.task_id !== undefined) {
      this.listQuery.task_id = parseInt(this.$route.query.task_id)
    }
    if (this.$route.query.app_id !== undefined) {
      this.nav_info.app.app_id = parseInt(this.$route.query.app_id)
    }
    this.getList()
    this.initNavInfo()
  },
  methods: {
    getList() {
      getList(this.listQuery).then(response => {
        this.list = response.data.list
        this.total = response.data.count
        setTimeout(() => {
          this.listLoading = false
        }, 1.5 * 1000)
      })
    },
    initNavInfo() {
      getApplicationDetail({ id: this.nav_info.app.app_id }).then(response => {
        this.nav_info.app.app_name = response.data.app_name
        this.nav_info.app.app_code = response.data.app_code
        this.nav_info.app.introduction = response.data.introduction
      })
      getTaskDetail({ id: this.listQuery.task_id }).then(response => {
        this.nav_info.task.task_name = response.data.name
      })
    },
    handleFilter() {
      this.listQuery.page = 1
      this.getList()
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
    showConsoleLog(row) {
      this.dialogConsoleVisible = true
      this.readLogQuery.id = row.id
      this.readLogQuery.start_line = 0
      this.temp.console_log = ''
      this.getConsoleLog()
      this.refreshConsoleLog()
    },
    getConsoleLog() {
      readConsoleLog(this.readLogQuery).then(response => {
        const content = response.data.content
        // eslint-disable-next-line no-empty
        if (content.length > 0) {
          content.forEach((item, index) => {
            this.temp.console_log = this.temp.console_log + item + '\n'
          })
        }
        this.readLogQuery.start_line = response.data.end_line + 1
      })
    },
    refreshConsoleLog() {
      if (this.intervalId != null) {
        return
      }
      this.intervalId = setInterval(() => {
        if (this.dialogConsoleVisible === false) {
          this.clearRefreshConsoleLog()
        } else {
          this.getConsoleLog()
        }
      }, 2000)
    },
    clearRefreshConsoleLog() {
      clearInterval(this.intervalId)
      this.intervalId = null
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
        path: '/scheduler/schedulerList', query: {
          app_id: this.nav_info.app.app_id,
          task_id: this.listQuery.task_id
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
