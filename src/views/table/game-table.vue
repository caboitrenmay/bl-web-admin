<template>
  <div class="app-container">
    <div class="filter-container" style="align-content: center">
      <el-date-picker v-model="dateSearch" type="date" placeholder="Vui lòng chọn ngày" />
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

      <el-table-column label="Giờ thi đấu" width="110px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.time | formatTime }}</span>
        </template>
      </el-table-column>
      <el-table-column label="Ngày thi đấu" width="110px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.time | formatDate }}</span>
        </template>
      </el-table-column>

      <el-table-column label="Bình luận viên" width="120px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.commentator }}</span>
        </template>
      </el-table-column>

      <el-table-column label="Video" align="center" width="95">
        <template slot-scope="{row}" v-if="row.gameVideoDto">
          <a :href="row.gameVideoDto.link" target="_blank"><img v-lazy="row.gameVideoDto.mediaUrls[0]" alt="thumnail" width="80" /></a>
        </template>
      </el-table-column>

      <el-table-column label="Đội tuyển A" width="110px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.clanTeamDto1 && row.clanTeamDto1.name }}</span>
        </template>
      </el-table-column>
      <el-table-column label="Đội tuyển B" width="110px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.clanTeamDto2 && row.clanTeamDto2.name }}</span>
        </template>
      </el-table-column>
      <el-table-column label="Giải đấu" width="110px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.tournamentDto && row.tournamentDto.name }}</span>
        </template>
      </el-table-column>

      <el-table-column v-if="showScore===true" label="Tỷ số" width="110px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.score }}</span>
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

    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="search"/>

    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
      <el-form ref="dataForm" :rules="rules" :model="temp" label-position="left" label-width="150px" style="width: 400px; margin-left:50px;">
        <el-form-item label="Ngày thi đấu" prop="time">
          <el-date-picker v-model="temp.time" type="datetime" placeholder="Vui lòng chọn thời gian"/>
        </el-form-item>
<!--        <el-form-item label="Trận thi đấu" prop="ccount">-->
<!--          <el-input-number v-model="temp.ccount"/>-->
<!--        </el-form-item>-->
        <el-form-item label="Bình luận viên" prop="commentator">
          <el-input v-model="temp.commentator"/>
        </el-form-item>
        <el-form-item label="Đội tuyển A" prop="team1id">
          <span style="margin-right: 15px">{{ temp.clanTeamDto1 && temp.clanTeamDto1.name }}</span>
          <span style="margin-right: 15px"> {{ !temp.clanTeamDto1? 'Chọn: ': 'Thay đổi: ' }}</span>
          <el-select v-model="temp.team1id" class="filter-item" placeholder="Please select">
            <el-option v-for="item in clanTeamList" :key="item.id" :label="item.name" :value="item.id"/>
          </el-select>
        </el-form-item>
        <el-form-item label="Đội tuyển B" prop="team2id">
          <span style="margin-right: 15px">{{ temp.clanTeamDto2 && temp.clanTeamDto2.name }}</span>
          <span style="margin-right: 15px"> {{ !temp.clanTeamDto2? 'Chọn: ': 'Thay đổi: ' }}</span>
          <el-select v-model="temp.team2id" class="filter-item" placeholder="Please select">
            <el-option v-for="item in clanTeamList" :key="item.id" :label="item.name" :value="item.id"/>
          </el-select>
        </el-form-item>
        <el-form-item label="Giải đấu" prop="tournamentId">
          <span style="margin-right: 15px">{{ temp.tournamentDto && temp.tournamentDto.name }}</span>
          <span style="margin-right: 15px"> {{ !temp.tournamentDto ? 'Chọn: ': 'Thay đổi: ' }}</span>
          <el-select v-model="temp.tournamentId" class="filter-item" placeholder="Please select">
            <el-option v-for="item in tournamentList" :key="item.id" :label="item.name" :value="item.id"/>
          </el-select>
        </el-form-item>
        <el-form-item v-if="showScore===true" label="Tỷ số" prop="score">
          <el-input v-model="temp.score"/>
        </el-form-item>

        <el-form-item label="Video" prop="link">
          <el-input v-model="temp.gameVideoDto.link" placeholder="Link của video" style="width: 500px"/>
        </el-form-item>
        <el-form-item label="Thumbnail">
          <img v-lazy="temp.gameVideoDto.mediaUrls[0]" alt="thumbnail" width="80" />
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
import { Message, MessageBox } from 'element-ui'
import moment from 'moment'
import { createGame, deleteGame, fetchGameList, getAllByTime, updateGame } from '@/api/game'
import { fetchClanTeamList } from '@/api/clan-team'
import { upload } from '@/api/upload'
import { createVideo, updateVideo } from '@/api/video'
import { fetchTournamentList } from '@/api/tour'
// secondary package based on el-pagination

export default {
  name: 'GameTable',
  components: { Pagination },
  directives: { waves },
  data() {
    return {
      tableKey: 0,
      list: null,
      total: 0,
      listLoading: true,
      dateSearch: null,
      showScore: false,
      listQuery: {
        page: 1,
        limit: 20,
        sort: '+id'
      },
      temp: {
        id: undefined,
        time: '',
        ccount: 3,
        commentator: null,
        clanTeamDto1: null,
        clanTeamDto2: null,
        team1id: null,
        team2id: null,
        score: null,
        gameVideoDto: {
          id: undefined,
          link: null,
          mediaUrls: [],
          createdOn: null,
          file: null,
          fileName: ''
        },
        videoId: null,
        tournamentDto: null,
        tournamentId: null
      },
      dialogFormVisible: false,
      dialogStatus: '',
      textMap: {
        update: 'Edit',
        create: 'Create'
      },
      clanTeamList: [],
      tournamentList: [],
      rules: {
        time: [{ required: true, message: 'time is required', trigger: 'blur' }],
        tournamentId: [{ required: true, message: 'tournament is required', trigger: 'change' }],
        score: [{ required: true, message: 'score is required', trigger: 'blur' }],
        team1id: [{ required: this.dialogStatus === 'create', message: 'teamA is required', trigger: 'blur' }],
        team2id: [{ required: this.dialogStatus === 'create', message: 'teamB is required', trigger: 'blur' }],
        // link: [{ required: true, message: 'link video is required', trigger: 'blur' }]
      }
    }
  },
  created() {
    this.getList()
    this.getAllClanTeam()
    this.getAllTournament()
    console.log('router: ', this.$route.path)
    if (this.$route.path.includes('score')) {
      this.showScore = true
    }
  },
  methods: {
    getAllClanTeam() {
      fetchClanTeamList().then(response => {
        this.clanTeamList = response.data
      })
    },
    getAllTournament() {
      fetchTournamentList().then(response => {
        this.tournamentList = response.data
      })
    },
    getList() {
      this.listLoading = true
      fetchGameList(this.listQuery).then(response => {
        // this.list = response.data.map((value, index) => {
        //   return { ...value, index: index + 1 }
        // })
        this.list = response.data.items.map((value, index) => {
          if (!value.gameVideoDto) {
            value.gameVideoDto = {
              link: '',
              mediaUrls: [],
              createdOn: null,
              file: null,
              fileName: ''
            }
          }
          return { ...value, index: index + 1 }
        })
        this.total = response.data.total

        // Just to simulate the time of the request
        setTimeout(() => {
          this.listLoading = false
        }, 1.5 * 1000)
      })
    },
    search() {
      if (!this.dateSearch) {
        this.getList()
        return
      }
      const time = moment(this.dateSearch).format('YYYY-MM-DD')
      getAllByTime({ time }, this.listQuery).then(response => {
        this.list = response.data.items.map((value, index) => {
          if (!value.gameVideoDto) {
            value.gameVideoDto = {
              link: '',
              mediaUrls: [],
              createdOn: null,
              file: null,
              fileName: ''
            }
          }
          return { ...value, index: index + 1 }
        })
        this.total = response.data.total
        // Just to simulate the time of the request
        setTimeout(() => {
          this.listLoading = false
        }, 1.5 * 1000)
      })
    },
    handleFilter() {
      this.listQuery.page = 1
      this.search()
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
        time: '',
        ccount: 3,
        commentator: null,
        clanTeamDto1: null,
        clanTeamDto2: null,
        team1id: null,
        team2id: null,
        score: null,
        gameVideoDto: {
          link: null,
          mediaUrls: [],
          createdOn: null,
          file: null,
          fileName: ''
        },
        videoId: null,
        tournamentDto: null,
        tournamentId: null
      }
    },
    handleCreate() {
      this.resetTemp()
      this.dialogStatus = 'create'
      this.rules.team1id = [{ required: true, message: 'teamA is required', trigger: 'blur' }]
      this.rules.team2id = [{ required: true, message: 'teamB is required', trigger: 'blur' }]
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    createData() {
      this.$refs['dataForm'].validate(async(valid) => {
        if (valid) {
          if (this.temp.team1id && this.temp.team2id && this.temp.team1id === this.temp.team2id) {
            this.$notify({
              title: 'Lỗi nhập liệu',
              message: 'Hai đội không được giống nhau',
              type: 'error',
              duration: 2000
            })
            return
          }
          if (!this.temp.gameVideoDto.link) {
            Message({
              message: 'Link video trống' || 'Error',
              type: 'error',
              duration: 2 * 1000
            })
            return
          }
          this.temp.time = moment(this.temp.time).format('YYYY-MM-DD HH:mm:ss')
          console.log('create data: ', this.temp)
          this.listLoading = true
          // upload file vs video
          const video = await this.uploadVideo()
          if (video) {
            this.temp.videoId = video.id
            this.temp.gameVideoDto.id = video.id
          }
          createGame(this.temp).then(res => {
            this.temp.id = res.data.id
            this.temp.clanTeamDto1 = this.clanTeamList.find(value => value.id === this.temp.team1id)
            this.temp.clanTeamDto2 = this.clanTeamList.find(value => value.id === this.temp.team2id)
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
          })
        }
      })
    },
    handleUpdate(row) {
      this.resetTemp()
      this.temp = Object.assign({}, row) // copy obj
      this.temp.clanTeamDto1 = Object.assign({}, row.clanTeamDto1)
      this.temp.clanTeamDto2 = Object.assign({}, row.clanTeamDto2)
      this.temp.gameVideoDto = Object.assign({}, row.gameVideoDto)
      this.temp.tournamentDto = Object.assign({}, row.tournamentDto)
      this.temp.tournamentId = this.temp.tournamentDto.id
      // this.temp.team1id = this.temp.clanTeamDto1.id
      // this.temp.team2id = this.temp.clanTeamDto2.id
      this.dialogStatus = 'update'
      delete this.rules.team1id
      delete this.rules.team2id
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    updateData() {
      this.$refs['dataForm'].validate(async(valid) => {
        if (valid) {
          if (this.temp.team1id && this.temp.team2id && this.temp.team1id === this.temp.team2id) {
            this.$notify({
              title: 'Lỗi nhập liệu',
              message: 'Hai đội không được giống nhau',
              type: 'error',
              duration: 2000
            })
            return
          }
          if (!this.temp.gameVideoDto.link) {
            Message({
              message: 'Link video trống' || 'Error',
              type: 'error',
              duration: 2 * 1000
            })
            return
          }
          // if (this.temp.gameVideoDto.link)
          const tempData = Object.assign({}, this.temp)
          tempData.clanTeamDto1 = this.clanTeamList.find(value => value.id === tempData.team1id)
          tempData.clanTeamDto2 = this.clanTeamList.find(value => value.id === tempData.team2id)
          tempData.time = moment(tempData.time).format('YYYY-MM-DD HH:mm:ss')
          // upload file vs video
          tempData.gameVideoDto = await this.uploadVideo()
          updateGame(tempData).then(() => {
            const index = this.list.findIndex(v => v.id === this.temp.id)
            this.temp.clanTeamDto1 = tempData.clanTeamDto1
            this.temp.clanTeamDto2 = tempData.clanTeamDto2
            this.temp.tournamentDto = this.tournamentList.find(value => value.id === this.temp.tournamentId)
            this.list.splice(index, 1, this.temp)
            this.dialogFormVisible = false
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
        deleteGame(row.id).then(v => {
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
      this.temp.gameVideoDto.file = file
      this.temp.gameVideoDto.fileName = 'game-video-thumb-' + moment().valueOf()
      this.createImage(file)

      // reset file
      e.target.value = null
    },
    createImage(file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        this.temp.gameVideoDto.mediaUrls = [e.target.result]
      }
      reader.readAsDataURL(file)
    },
    removeImage(e) {
      this.temp.gameVideoDto.mediaUrls = []
    },
    async uploadVideo() {
      if (!this.temp.gameVideoDto.link) {
        Message({
          message: 'Cảnh báo link video trống' || 'Error',
          type: 'error',
          duration: 2 * 1000
        })
        return new Promise((resolve, reject) => {
          reject(this.temp.gameVideoDto)
        })
      }
      // upload file
      if (this.temp.gameVideoDto.file) {
        const res = await upload({ image: this.temp.gameVideoDto.file }, { fileName: this.temp.gameVideoDto.fileName })
        this.temp.gameVideoDto.fileName = null
        this.temp.gameVideoDto.file = null
        if (res.data) {
          this.temp.gameVideoDto.mediaUrls = [res.data]
        }
      }
      // create video
      let res
      if (this.temp.gameVideoDto.id) {
        res = await updateVideo(this.temp.gameVideoDto)
      } else {
        res = await createVideo(this.temp.gameVideoDto)
      }
      if (res) {
        return res.data
      }
    }
  }
}
</script>

<style>

</style>
