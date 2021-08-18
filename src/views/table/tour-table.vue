<template>
  <div class="app-container">
    <div class="filter-container" style="height: 60px">
<!--      <el-input v-model="listQuery.name" placeholder="Tên" style="width: 200px;" class="filter-item" @keyup.enter.native="handleFilter" />-->
<!--      <el-button v-waves class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">-->
<!--        Search-->
<!--      </el-button>-->
      <el-button class="filter-item right" type="primary" icon="el-icon-edit" @click="handleCreate">
        Add
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
    >
      <el-table-column label="STT" align="center" width="80px">
        <template slot-scope="{row}">
          <span>{{ row.index }}</span>
        </template>
      </el-table-column>
<!--      <el-table-column label="Ảnh" align="center" width="95">-->
<!--        <template slot-scope="{row}">-->
<!--          <img v-lazy="row.avatar" alt="thumnail" width="80" />-->
<!--        </template>-->
<!--      </el-table-column>-->

      <el-table-column label="Tên" width="180px">
        <template slot-scope="{row}">
          <span>{{ row.name }}</span>
        </template>
      </el-table-column>
      <el-table-column label="Thông tin" min-width="180px">
        <template slot-scope="{row}">
          <span>{{ row.info }}</span>
        </template>
      </el-table-column>
      <el-table-column label="Ngày bắt đầu" width="150px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.startTime | formatDate }}</span>
        </template>
      </el-table-column>

      <el-table-column label="Ngày kết thúc" width="150px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.endTime | formatDate }}</span>
        </template>
      </el-table-column>

      <el-table-column label="Hành động" align="center" width="160px" class-name="small-padding fixed-width">
        <template slot-scope="{row,$index}">
          <el-button type="primary" size="mini" @click="handleUpdate(row)">
            Edit
          </el-button>
          <el-button size="mini" type="danger" @click="handleDelete(row,$index)">
            Delete
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="getList" />

    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
      <el-form ref="dataForm" :rules="rules" :model="temp" label-position="left" label-width="120px" style="width: 400px; margin-left:50px;">
        <el-form-item label="Tên" prop="name">
          <el-input v-model="temp.name" />
        </el-form-item>
        <el-form-item label="Thông tin" prop="info">
          <el-input v-model="temp.info" type="textarea" placeholder="Thông tin" />
        </el-form-item>
        <el-form-item label="Tiền thưởng" prop="totalBonus">
          <el-input v-model="temp.totalBonus" />
        </el-form-item>
        <el-form-item label="Ngày bắt đầu" prop="startTime">
          <el-date-picker v-model="temp.startTime" type="datetime" placeholder="Please pick a date" />
        </el-form-item>
        <el-form-item label="Ngày kết thúc" prop="endTime">
          <el-date-picker v-model="temp.endTime" type="datetime" placeholder="Please pick a date" />
        </el-form-item>
<!--        <el-form-item label="Avatar">-->
<!--          <img v-lazy="temp.avatar" alt="thumbnail" width="80" />-->
<!--        </el-form-item>-->
<!--        <el-form-item label="Chọn ảnh">-->
<!--          <input type="file" @change="onFileChange" />-->
<!--        </el-form-item>-->
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">
          Cancel
        </el-button>
        <el-button type="primary" @click="dialogStatus==='create'?createData():updateData()">
          Confirm
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import waves from '@/directive/waves' // waves directive
import { parseTime } from '@/utils'
import Pagination from '@/components/Pagination'
import { MessageBox } from 'element-ui'
import moment from 'moment'
import { upload } from '@/api/upload'
import { createTournament, deleteTournament, fetchTournamentList, updateTournament } from '@/api/tour'
// secondary package based on el-pagination

export default {
  name: 'NewsTeamTable',
  components: { Pagination },
  directives: { waves },
  data() {
    return {
      tableKey: 0,
      list: null,
      total: 0,
      listLoading: true,
      listQuery: {
        page: 1,
        limit: 20,
        name: undefined,
        sort: '+id'
      },
      // sortOptions: [{ label: 'ID Ascending', key: '+id' }, { label: 'ID Descending', key: '-id' }],
      temp: {
        id: undefined,
        name: '',
        info: '',
        avatar: null,
        endTime: null,
        startTime: null,
        totalBonus: '',
        file: null,
        fileName: ''
      },
      dialogFormVisible: false,
      dialogStatus: '',
      textMap: {
        update: 'Edit',
        create: 'Create'
      },
      rules: {
        name: [{ required: true, message: 'name is required', trigger: 'change' }],
        info: [{ required: true, message: 'info is required', trigger: 'change' }],
        startTime: [{ required: true, message: 'startTime is required', trigger: 'blur' }],
        endTime: [{ required: true, message: 'endTime is required', trigger: 'blur' }]
      }
    }
  },
  created() {
    this.getList()
  },
  methods: {
    getList() {
      this.listLoading = true
      fetchTournamentList().then(response => {
        if (response.data) {
          this.list = response.data.map((value, index) => {
            return { ...value, index: index + 1 }
          })
          this.total = 1
        }

        // Just to simulate the time of the request
        setTimeout(() => {
          this.listLoading = false
        }, 1.5 * 100)
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
        name: '',
        info: '',
        avatar: null,
        endTime: null,
        startTime: null,
        totalBonus: '',
        file: null,
        fileName: ''
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
      this.$refs['dataForm'].validate(async(valid) => {
        if (valid) {
          const endAfterStart = moment(this.temp.endTime).isAfter(this.temp.startTime)
          if (!endAfterStart) {
            this.$notify({
              title: 'Lỗi nhập liệu',
              message: 'Ngày kết thúc phải lớn hơn ngày bắt đầu',
              type: 'error',
              duration: 2000
            })
            return
          }
          this.temp.startTime = moment(this.temp.startTime).format('YYYY-MM-DD HH:mm:ss')
          this.temp.endTime = moment(this.temp.endTime).format('YYYY-MM-DD HH:mm:ss')
          console.log('create data: ', this.temp)
          this.listLoading = true
          if (this.temp.file) {
            const res = await upload({ image: this.temp.file }, { fileName: this.temp.fileName })
            if (res.data) {
              this.temp.avatar = res.data
            }
          }
          const res = await createTournament(this.temp)
          this.temp.id = res.data.id
          this.temp.index = this.list.length + 1
          this.list.push(this.temp)
          // this.list.unshift(this.temp)
          this.dialogFormVisible = false
          this.listLoading = false
          this.$notify({
            title: 'Success',
            message: 'Created Successfully',
            type: 'success',
            duration: 2000
          })
        }
      })
    },
    handleUpdate(row) {
      this.temp = Object.assign({}, row) // copy obj
      this.dialogStatus = 'update'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    updateData() {
      this.$refs['dataForm'].validate(async(valid) => {
        if (valid) {
          const endAfterStart = moment(this.temp.endTime).isAfter(this.temp.startTime)
          if (!endAfterStart) {
            this.$notify({
              title: 'Lỗi nhập liệu',
              message: 'Ngày kết thúc phải lớn hơn ngày bắt đầu',
              type: 'error',
              duration: 2000
            })
            return
          }
          const tempData = Object.assign({}, this.temp)
          tempData.startTime = moment(tempData.startTime).format('YYYY-MM-DD HH:mm:ss')
          this.listLoading = true
          if (tempData.file) {
            const res = await upload({ image: this.temp.file }, { fileName: this.temp.fileName })
            if (res.data) {
              tempData.avatar = res.data
            }
          }
          updateTournament(tempData).then(() => {
            const index = this.list.findIndex(v => v.id === this.temp.id)
            this.list.splice(index, 1, this.temp)
            this.dialogFormVisible = false
            this.listLoading = false
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
      MessageBox.confirm('Are you sure?').then(data => {
        console.log(data)
        deleteTournament(row.id).then(v => {
          this.$notify({
            title: 'Success',
            message: 'Delete Successfully',
            type: 'success',
            duration: 2000
          })
          this.list.splice(index, 1)
        }).catch(err => {
          console.error(err)
        })
      }).catch(err => {
        console.error(err)
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
    getSortClass: function(key) {
      const sort = this.listQuery.sort
      return sort === `+${key}` ? 'ascending' : 'descending'
    },
    onFileChange(e) {
      const files = e.target.files || e.dataTransfer.files
      if (!files.length) {
        return
      }
      const file = files[0]
      console.log(file)
      if (file.size > 2 * 1024 * 1024) {
        alert('File > 2Mb')
        return
      }
      this.temp.file = file
      this.temp.fileName = 'tour-thumb-' + this.temp.name
      this.createImage(file)

      // reset file
      e.target.value = null
    },
    createImage(file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        this.temp.avatar = e.target.result
      }
      reader.readAsDataURL(file)
    },
    removeImage(e) {
      this.temp.avatar = null
    }
  }
}
</script>
