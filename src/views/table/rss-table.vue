<template>
  <div class="app-container">
    <div class="filter-container">
      <el-select v-model="listQuery.source" class="filter-item" placeholder="Chọn nguồn">
        <el-option v-for="item in sources" :key="item" :label="item === '' ? 'tất cả' : item" :value="item" />
      </el-select>
      <el-input v-model="listQuery.name" placeholder="Tiêu đề" style="width: 200px;" class="filter-item" @keyup.enter.native="handleFilter" />
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
      <el-table-column label="Active" align="center" width="80px">
        <template slot-scope="{row}">
          {{ row.active ? 'Yes' : 'No' }}
        </template>
      </el-table-column>
      <el-table-column label="Url" align="center" min-width="240px">
        <template slot-scope="{row}">
          <el-link :href="row.url" target="_blank">{{ row.url }}</el-link>
        </template>
      </el-table-column>

      <el-table-column label="Tiêu đề" min-width="120px">
        <template slot-scope="{row}">
          <span>{{ row.name }}</span>
        </template>
      </el-table-column>
      <el-table-column label="Nguồn" width="120px">
        <template slot-scope="{row}">
          <span>{{ row.source }}</span>
        </template>
      </el-table-column>

      <el-table-column label="Biên tập chọn" width="150px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.editorChoice ? 'Yes' : 'No' }}</span>
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

        <el-form-item label="Url" prop="url">
          <el-input v-model="temp.url" placeholder="Url của rss" />
        </el-form-item>
        <el-form-item label="Tiêu đề" prop="name">
          <el-input v-model="temp.name" />
        </el-form-item>
        <el-form-item label="Nguồn" prop="source">
          <el-input v-model="temp.source" />
        </el-form-item>

        <el-form-item label="Tình trạng">
          <el-radio-group v-model="temp.active" @change="activeChangeHandler">
            <el-radio :label="true">Yes</el-radio>
            <el-radio :label="false">No</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="Biên tập chọn" prop="editorChoice">
          <el-radio-group v-model="temp.editorChoice" @change="editorChangeHandler">
            <el-radio :label="true">Yes</el-radio>
            <el-radio :label="false">No</el-radio>
          </el-radio-group>
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
import Pagination from '@/components/Pagination'
import { MessageBox } from 'element-ui'
import { fetchRssList, createRss, updateRss, deleteRss, fetchSourceList } from '@/api/rss'
// secondary package based on el-pagination

export default {
  name: 'RssTable',
  components: { Pagination },
  directives: { waves },
  data() {
    return {
      tableKey: 0,
      sources: [],
      list: null,
      total: 0,
      listLoading: true,
      listQuery: {
        page: 1,
        limit: 20,
        name: undefined,
        sortBy: '-active'
      },
      // sortOptions: [{ label: 'ID Ascending', key: '+id' }, { label: 'ID Descending', key: '-id' }],
      temp: {
        id: undefined,
        url: null,
        name: null,
        source: null,
        active: false,
        editorChoice: false
      },
      dialogFormVisible: false,
      dialogStatus: '',
      textMap: {
        update: 'Edit',
        create: 'Create'
      },
      activeData: [{ status: false, name: 'Yes' }, { status: true, name: 'No' }],
      rules: {
        name: [{ required: true, message: 'name is required', trigger: 'change' }],
        source: [{ required: true, message: 'source is required', trigger: 'change' }],
        url: [{ required: true, message: 'url is required', trigger: 'blur' }]
      }
    }
  },
  created() {
    this.getList()
  },
  methods: {
    getList() {
      this.listLoading = true
      fetchSourceList().then(sources => {
        this.sources = ['', ...sources]
      })
      for (const [key, value] of Object.entries(this.listQuery)) {
        if (value === '') {
          this.listQuery[key] = undefined
        }
      }
      fetchRssList(this.listQuery).then(data => {
        this.list = data.results
        this.total = data.totalResults

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
        this.listQuery.sortBy = '+id'
      } else {
        this.listQuery.sortBy = '-id'
      }
      this.handleFilter()
    },
    resetTemp() {
      this.temp = {
        id: undefined,
        url: null,
        name: null,
        source: this.listQuery.source,
        active: true,
        editorChoice: false
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
            console.log('create data: ', this.temp)
            this.listLoading = true

            const res = await createRss(this.temp)
            this.temp.id = res.id
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
            this.listLoading = true
            const id = tempData.id
            delete tempData.id
            await updateRss(id, tempData)
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
          }
        }
      })
    },
    handleDelete(row, index) {
      MessageBox.confirm('Are you sure?').then(data => {
        console.log(data)
        deleteRss(row.id).then(v => {
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
    activeChangeHandler(v) {
      console.log('==> activeChangeHandler: ', v)
      this.temp.active = v
    },
    editorChangeHandler(v) {
      console.log('==> editorChangeHandler', v)
      this.temp.editorChoice = v
    }
  }
}
</script>
