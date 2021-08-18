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
      <el-table-column label="Avatar" align="center" width="95">
        <template slot-scope="{row}">
          <img v-lazy="row.avatar" alt="avatar" width="80" />
        </template>
      </el-table-column>

      <el-table-column label="Tên" min-width="180px">
        <template slot-scope="{row}">
          <span>{{ row.name }}</span>
        </template>
      </el-table-column>

      <el-table-column label="Tên hiển thị" min-width="180px">
        <template slot-scope="{row}">
          <span>{{ row.displayName }}</span>
        </template>
      </el-table-column>

      <el-table-column label="Ngày thành lập" width="110px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.birthday | formatDate }}</span>
        </template>
      </el-table-column>

      <el-table-column label="Thông tin" width="110px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.info }}</span>
        </template>
      </el-table-column>
      <el-table-column label="Tình trạng" width="160px" align="center">
        <template slot-scope="{row}">
          <span>{{ getIsActive(row) }}</span>
        </template>
      </el-table-column>

      <el-table-column label="Đội tuyển" width="110px" align="center">
        <template slot-scope="{row}">
          <span>{{ getGroupType(row) }}</span>
        </template>
      </el-table-column>

      <el-table-column label="Hành động" align="center" width="160" class-name="small-padding fixed-width">
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
      <el-form ref="dataForm" :rules="rules" :model="temp" label-position="left" label-width="120px" style="width: 400px; margin-left:40px;">
        <el-form-item label="Tên" prop="name">
          <el-input v-model="temp.name" />
        </el-form-item>
        <el-form-item label="Tên đầy đủ" prop="displayName">
          <el-input v-model="temp.displayName" />
        </el-form-item>
        <el-form-item label="Ngày thành lập" prop="birthday">
          <el-date-picker v-model="temp.birthday" type="datetime" placeholder="Please pick a date" />
        </el-form-item>
        <el-form-item label="Thông tin">
          <el-input v-model="temp.info" />
        </el-form-item>
        <el-form-item label="Tình trạng">
          <el-select v-model="temp.isActive" class="filter-item" placeholder="Please select">
            <el-option v-for="item in activeData" :key="item.status" :label="item.name" :value="item.status" />
          </el-select>
        </el-form-item>
        <el-form-item label="Đội tuyển" prop="type">
          <el-select v-model="temp.type" class="filter-item" placeholder="Please select">
            <el-option v-for="item in clanTeamType" :key="item.id" :label="item.name" :value="item.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="Avatar">
          <img v-lazy="temp.avatar" alt="avatar" width="80" />
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
// import { fetchPv } from '@/api/article'
import waves from '@/directive/waves' // waves directive
import { parseTime } from '@/utils'
import Pagination from '@/components/Pagination'
import { MessageBox } from 'element-ui'
import moment from 'moment'
import { createClanTeam, deleteClanTeam, getClanTeamList, updateClanTeam } from '@/api/clan-team'
import { upload } from '@/api/upload'
// secondary package based on el-pagination

export default {
  name: 'ClanTeamTable',
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
        birthday: null,
        displayName: '',
        name: '',
        info: '',
        isActive: true,
        avatar: '',
        file: null,
        fileName: '',
        type: null
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
        // birthday: [{ required: true, message: 'birthday is required', trigger: 'change' }],
        displayName: [{ required: true, message: 'username is required', trigger: 'blur' }],
        type: [{ required: true, message: 'type is required', trigger: 'blur' }]
      }
    }
  },
  created() {
    this.getList()
  },
  methods: {
    getList() {
      this.listLoading = true
      getClanTeamList(this.listQuery).then(response => {
        this.list = response.data.items
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
        birthday: null,
        displayName: '',
        name: '',
        info: '',
        isActive: true,
        avatar: '',
        type: null
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
          this.temp.birthday = this.temp.birthday && moment(this.temp.birthday).format('YYYY-MM-DD HH:mm:ss')
          console.log('create data: ', this.temp)
          this.listLoading = true
          if (this.temp.file) {
            const res = await upload({ image: this.temp.file }, { fileName: this.temp.fileName })
            if (res.data) {
              this.temp.avatar = res.data
            }
          }
          const res = await createClanTeam(this.temp)
          this.temp.id = res.data.id
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
          const tempData = Object.assign({}, this.temp)
          tempData.birthday = tempData.birthday && moment(tempData.birthday).format('YYYY-MM-DD HH:mm:ss')

          this.listLoading = true
          if (this.temp.file) {
            const res = await upload({ image: this.temp.file }, { fileName: this.temp.fileName })
            if (res.data) {
              tempData.avatar = res.data
            }
          }
          await updateClanTeam(tempData)

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
        }
      })
    },
    handleDelete(row, index) {
      MessageBox.confirm('Are you sure?').then(data => {
        console.log(data)
        this.listLoading = true
        deleteClanTeam(row.id).then(v => {
          this.listLoading = false
          this.$notify({
            title: 'Success',
            message: 'Delete Successfully',
            type: 'success',
            duration: 2000
          })
          this.list.splice(index, 1)
        }).catch(err => {
          this.listLoading = false
          this.$notify({
            title: 'Thất bại',
            message: 'Không xoá được vì đang có các thành viên trong tồn tại',
            type: 'error',
            duration: 2000
          })
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
      this.temp.fileName = 'avatar-' + this.temp.name
      this.createImage(file)
    },
    createImage(file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        this.temp.avatar = e.target.result
      }
      reader.readAsDataURL(file)
    },
    removeImage(e) {
      this.temp.avatar = ''
    },
    getIsActive(row) {
      if (row) {
        const act = this.activeData.find(value => value.status === row.isActive)
        if (act) {
          return act.name
        }
      }
      return ''
    },
    getGroupType(row) {
      if (row) {
        const ctType = this.clanTeamType.find(value => value.id === row.type)
        if (ctType) {
          return ctType.name
        }
      }
      return ''
    }
  }
}
</script>
