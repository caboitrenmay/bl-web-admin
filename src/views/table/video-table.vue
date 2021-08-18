<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input v-model="listQuery.name" placeholder="Tên" style="width: 200px;" class="filter-item" @keyup.enter.native="handleFilter" />
      <el-button v-waves class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">
        Search
      </el-button>
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
      <el-table-column label="Video" align="center" width="95">
        <template slot-scope="{row}">
          <a :href="row.link" target="_blank"><img v-lazy="row.mediaUrls[0]" alt="thumnail" width="80" /></a>
        </template>
      </el-table-column>

      <el-table-column label="Tiêu đề" min-width="180px">
        <template slot-scope="{row}">
          <span>{{ row.name }}</span>
        </template>
      </el-table-column>
      <el-table-column label="Nguồn" width="80px">
        <template slot-scope="{row}">
          <span>{{ row.source }}</span>
        </template>
      </el-table-column>

      <el-table-column label="Ngày xuất bản" width="150px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.createdOn | formatDate }}</span>
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
        <el-form-item label="Tiêu đề" prop="name">
          <el-input v-model="temp.name" />
        </el-form-item>
        <el-form-item label="Ngày xuất bản" prop="createdOn">
          <el-date-picker v-model="temp.createdOn" type="datetime" placeholder="Please pick a date" />
        </el-form-item>
        <el-form-item label="Video" prop="link">
          <el-input v-model="temp.link" placeholder="Link của video" />
        </el-form-item>
        <el-form-item label="Nguồn" prop="source">
          <el-input v-model="temp.source" />
        </el-form-item>
        <el-form-item label="Thumbnail">
          <img v-lazy="temp.mediaUrls[0]" alt="thumbnail" width="80" />
        </el-form-item>
        <el-form-item label="Chọn ảnh">
          <input type="file" @change="onFileChange" />
        </el-form-item>
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
import { createVideo, deleteVideo, fetchVideoList, updateVideo } from '@/api/video'
import { upload } from '@/api/upload'
// secondary package based on el-pagination

export default {
  name: 'VideoTeamTable',
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
      clanTeamType: [{ id: 0, name: 'Clan' }, { id: 1, name: 'Team' }],
      temp: {
        id: undefined,
        link: '',
        description: '',
        name: '',
        source: '',
        viewerCount: 0,
        mediaUrls: [],
        createdOn: null,
        file: null,
        fileName: ''
      },
      dialogFormVisible: false,
      dialogStatus: '',
      textMap: {
        update: 'Edit',
        create: 'Create'
      },
      activeData: [{ status: false, name: 'Đang tạm dừng' }, { status: true, name: 'Đang hoạt động' }],
      rules: {
        name: [{ required: true, message: 'name is required', trigger: 'change' }],
        createdOn: [{ required: true, message: 'createdOn is required', trigger: 'change' }],
        link: [{ required: true, message: 'link is required', trigger: 'blur' }]
      }
    }
  },
  created() {
    this.getList()
  },
  methods: {
    getList() {
      this.listLoading = true
      fetchVideoList(this.listQuery).then(response => {
        this.list = response.data.items.map((value, index) => {
          return { ...value, index: index + 1 }
        })
        this.total = response.data.total

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
        link: '',
        description: '',
        name: '',
        source: '',
        viewerCount: 0,
        mediaUrls: [],
        createdOn: null,
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
          try {
            this.temp.createdOn = moment(this.temp.createdOn).format('YYYY-MM-DD HH:mm:ss')
            console.log('create data: ', this.temp)
            this.listLoading = true
            if (this.temp.file) {
              const res = await upload({ image: this.temp.file }, { fileName: this.temp.fileName })
              if (res.data) {
                this.temp.mediaUrls = [res.data]
              }
            }
            const res = await createVideo(this.temp)
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
          } catch (e) {
            console.error(e)
            this.listLoading = false
            this.dialogFormVisible = false
          }
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
          try {
            const tempData = Object.assign({}, this.temp)
            tempData.createdOn = moment(tempData.createdOn).format('YYYY-MM-DD HH:mm:ss')
            this.listLoading = true
            if (tempData.file) {
              const res = await upload({ image: this.temp.file }, { fileName: this.temp.fileName })
              if (res.data) {
                tempData.mediaUrls = [res.data]
              }
            }
            await updateVideo(tempData)
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
          } catch (e) {
            console.error(e)
            this.listLoading = false
            this.dialogFormVisible = false
          }
        }
      })
    },
    handleDelete(row, index) {
      MessageBox.confirm('Are you sure?').then(data => {
        console.log(data)
        deleteVideo(row.id).then(v => {
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
      this.temp.fileName = 'video-thumb-' + this.temp.name
      this.createImage(file)

      // reset file
      e.target.value = null
    },
    createImage(file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        this.temp.mediaUrls = [e.target.result]
      }
      reader.readAsDataURL(file)
    },
    removeImage(e) {
      this.temp.mediaUrls = []
    }
  }
}
</script>
