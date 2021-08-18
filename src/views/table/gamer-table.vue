<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input v-model="listQuery.username" placeholder="nick name" style="width: 200px;" class="filter-item" @keyup.enter.native="handleFilter" />
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

      <el-table-column label="Họ tên" min-width="180px">
        <template slot-scope="{row}">
          <span>{{ row.name }}</span>
        </template>
      </el-table-column>

      <el-table-column label="Nick name" width="180px">
        <template slot-scope="{row}">
          <span>{{ row.username }}</span>
        </template>
      </el-table-column>

      <el-table-column label="Ngày sinh" width="110px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.birthday | formatDate }}</span>
        </template>
      </el-table-column>

      <el-table-column label="Quê quán" width="110px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.homeTown }}</span>
        </template>
      </el-table-column>
      <el-table-column label="Quốc gia" width="110px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.nation }}</span>
        </template>
      </el-table-column>

      <el-table-column label="Đội tuyển" width="110px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.clanTeam && row.clanTeam.name }}</span>
        </template>
      </el-table-column>

<!--      <el-table-column label="Trận TĐ" class-name="status-col" width="80">-->
<!--        <template slot-scope="{row}">-->
<!--          <el-button type="primary" size="mini" @click="handleFetchPv(row)">-->
<!--            View-->
<!--          </el-button>-->
<!--        </template>-->
<!--      </el-table-column>-->

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
      <el-form ref="dataForm" :rules="rules" :model="temp" label-position="left" label-width="110px" style="width: 400px; margin-left:50px;">
        <el-form-item label="Họ tên" prop="name">
          <el-input v-model="temp.name" />
        </el-form-item>
        <el-form-item label="Nick name" prop="username">
          <el-input v-model="temp.username" :disabled="dialogStatus==='update'"/>
        </el-form-item>
        <el-form-item label="Đội tuyển">
          <span style="margin-right: 15px">{{ temp.clanTeam && temp.clanTeam.name }}</span>
          <span style="margin-right: 15px"> Thay đổi: </span>
          <el-select v-model="temp.clanTeamId" class="filter-item" placeholder="Please select">
            <el-option v-for="item in clanTeamList" :key="item.id" :label="item.name" :value="item.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="Quê quán">
          <el-input v-model="temp.homeTown" />
        </el-form-item>
        <el-form-item label="Quốc gia">
          <el-input v-model="temp.nation" />
        </el-form-item>
        <el-form-item label="Ngày sinh">
          <el-date-picker v-model="temp.birthday" type="date" placeholder="Please pick a date" />
        </el-form-item>
        <el-form-item label="Avatar">
          <img v-lazy="temp.avatar" alt="avatar" width="80" />
        </el-form-item>
        <el-form-item label="Chọn ảnh">
          <input type="file" accept="image/png, image/jpeg" @change="onFileChange"/>
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
// import { fetchPv } from '@/api/article'
import { fetchGamerList, updateGamer, createGamer, deleteGamer } from '@/api/gamer'
import waves from '@/directive/waves' // waves directive
import { parseTime } from '@/utils'
import Pagination from '@/components/Pagination'
import { MessageBox } from 'element-ui'
import moment from 'moment'
import { fetchClanTeamList } from '@/api/clan-team'
import { upload } from '@/api/upload'
// secondary package based on el-pagination

export default {
  name: 'GamerTable',
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
        username: undefined,
        sort: '+id'
      },
      // sortOptions: [{ label: 'ID Ascending', key: '+id' }, { label: 'ID Descending', key: '-id' }],
      clanTeamList: [],
      temp: {
        id: undefined,
        birthday: null,
        username: '',
        name: '',
        homeTown: '',
        nation: '',
        clanTeam: null,
        clanTeamId: null,
        avatar: '',
        file: null,
        fileName: ''
      },
      dialogFormVisible: false,
      dialogStatus: '',
      textMap: {
        update: 'Edit',
        create: 'Create'
      },
      dialogPvVisible: false,
      pvData: [],
      rules: {
        name: [{ required: true, message: 'name is required', trigger: 'change' }],
        // birthday: [{ required: true, message: 'birthday is required', trigger: 'change' }],
        username: [{ required: true, message: 'username is required', trigger: 'blur' }]
      }
    }
  },
  created() {
    this.getList()
    this.getAllClanTeam()
  },
  methods: {
    getAllClanTeam() {
      fetchClanTeamList().then(response => {
        this.clanTeamList = response.data
      })
    },
    getList() {
      this.listLoading = true
      fetchGamerList(this.listQuery).then(response => {
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
        username: '',
        name: '',
        homeTown: '',
        nation: '',
        clanTeam: null,
        clanTeamId: null,
        avatar: '',
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
          this.temp.birthday = this.temp.birthday && moment(this.temp.birthday).format('YYYY-MM-DD HH:mm:ss')
          console.log('create data: ', this.temp)

          this.listLoading = true
          if (this.temp.file) {
            const res = await upload({ image: this.temp.file }, { fileName: this.temp.fileName })
            if (res.data) {
              this.temp.avatar = res.data
            }
          }
          const res = await createGamer(this.temp)
          this.temp.id = res.data.id
          this.temp.clanTeam = this.clanTeamList.find(value => value.id === this.temp.clanTeamId)
          // this.list.push(this.temp)
          this.list.unshift(this.temp)
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
      this.temp.clanTeam = Object.assign({}, row.clanTeam)
      // if (!this.temp.clanTeamId) {
      //   this.temp.clanTeamId = this.temp.clanTeam && this.temp.clanTeam.id
      // }
      this.dialogStatus = 'update'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    updateData() {
      this.$refs['dataForm'].validate(async(valid) => {
        console.log('validate: ', valid)
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
          await updateGamer(tempData)
          const index = this.list.findIndex(v => v.id === this.temp.id)
          this.temp.clanTeam = this.clanTeamList.find(value => value.id === this.temp.clanTeamId)
          this.list.splice(index, 1, this.temp)
          this.listLoading = false
          this.dialogFormVisible = false
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
        deleteGamer(row.id).then(v => {
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
    handleFetchPv(pv) {
      // todo
      this.pvData = ['fake1', 'fake2']
      this.dialogPvVisible = true
      // fetchPv(pv).then(response => {
      //   this.pvData = response.data.pvData
      //   this.dialogPvVisible = true
      // })
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
      console.log(files)
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
      this.temp.avatar = ''
    }
  }
}
</script>
