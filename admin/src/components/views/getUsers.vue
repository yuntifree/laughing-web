<template>
  <div class="mana_container">
    <article class="module width_3_quarter">
      <header class="app_header">
        <div>
          <button class="btn btn-default btn-sm outline-none" @click="addUser">
          <i class="iconfont icon-add"></i>添加用户
          </button>
        </div>
        <div>
          <div class="quick_search">
            <i class="iconfont icon-search"></i>
            <input class="ipt-search" type="text" placeholder="ID/电话/用户名">
          </div>
          <button class="btn btn-default btn-ssm" @click="getData(0)">刷新</button>
        </div>
      </header>
      <!--end:右键菜单-->
      <div class="tab_container" ref="tableContent">
        <div class="tab_content tab-fixed" v-if="dataReady">
          <template>
            <el-table
              :data="infos"
              :height="tableHeight"
              border>
              <el-table-column
                inline-template
                label="id">
                <div>{{row.id||'-'}}</div>
              </el-table-column>
              <el-table-column
                inline-template
                label="imei">
                <div>{{row.imei||'-'}}</div>
              </el-table-column>
              <el-table-column
                inline-template
                label="头像">
                <div><img class="height80" :src="row.headurl"></div>
              </el-table-column>
              <el-table-column
                inline-template
                label="昵称">
                <div>{{row.nickname||'-'}}</div>
              </el-table-column>
              <el-table-column
                inline-template
                label="粉丝数">
                <div>{{row.followers||'-'}}</div>
              </el-table-column>
              <el-table-column
                inline-template
                label="关注数">
                <div>{{row.following||0}}</div>
              </el-table-column>
              <el-table-column
                inline-template
                label="注册时间">
                <div>{{row.ctime||'-'}}</div>
              </el-table-column>
            </el-table>
          </template>
        </div>
      </div>
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="pageCfg.currentPage"
        :page-size="pageCfg.limit"
        layout="prev, pager, next, jumper"
        :total="pageCfg.total || 1">
      </el-pagination>
      <div class="shade" v-if="modal.addShow" >
        <div class="edit-form" style="width:600px">
          <div class="form-title">{{modal.title}}</div>
          <el-form :model="addInfo" ref="ruleForm" label-width="80px">
            <el-form-item 
              label="昵称" 
              prop="nickname"
              :rules="[
                { required: true, message: '昵称不能为空', trigger: 'blur'}
              ]">
              <el-input v-model.number="addInfo.nickname" placeholder="请填写昵称"
              ></el-input>
            </el-form-item>
            <el-form-item label="头像">
              <uploader></uploader>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="addPost">确定</el-button>
              <el-button @click="modal.addShow=false">取消</el-button>
            </el-form-item>
          </el-form>
        </div>
      </div>
      <div v-show="alertShow">
        <el-alert
          :title="alertMsg"
          type="dark">
        </el-alert>
      </div>
    </article>
  </div>
</template>
<script>
import CGI from '../../lib/cgi.js'
import uploader from '../lib/uploader.vue'
var columns = ['id','手机号','imei','最近在线','备注'];
var searchParams = {};
export default {
  data() {
    return {
      dataReady: false,
      pageCfg: {
        total: 1,
        currentPage: 1,
        start: 0,
        limit: 30,
      },

      // table data
      infos: [],
      columns: columns,

      selIdx: -1,
      alertShow: false,
      alertMsg: '',
      addInfo: {
        nickname: '',
      },
      modal: {
        title: '',
        addShow: false,
      },
      rules: {
        nickname: [
          { required: true, message: '请填写版本号', trigger: 'blur'}
        ]
      }
    }
  },
  components: {
    uploader
  },
  computed: {
    tableHeight() {
      return this.$store.state.tableHeight;
    }
  },
  watch: {
    alertShow() {
      if (this._timeout) clearTimeout(this._timeout)
      if (this.alertShow) {
        this._timeout = setTimeout(()=> this.alertShow = false, 1500);
      } else {
        return this.alertShow;
      }
    }
  },
  mounted() {
    if (!this.tableHeight) {
      this.$nextTick(()=> {
        this.$store.state.tableHeight = this.$refs.tableContent.offsetHeight;
      });
    }
    this.getData(true);
  },
  methods: {
    getData(reload) {
      //判断分页是否为第一页
      if (reload) {
        this.pageCfg.start = 0;
      }

      var param = {
        seq: this.pageCfg.start || 0,
        num: 30,
      };
      CGI.post(this.$store.state, 'get_users', param, (resp) => {
        if (resp.errno === 0) {
          var data = resp.data;
          if (data.infos) {
            this.infos = data.infos;
          }
          this.pageCfg.total = data.total;
          this.dataReady = true;
        } else {
          this.alertInfo(resp.desc);
        }
      });
    },
    addUser() {
      this.modal.title = '添加';
      this.addInfo.nickname = '';
      this.modal.addShow = true;
    },
    addPost() {
      this.$refs['ruleForm'].validate((valid)=> {
        if (valid) {
          var param = {
            nickname: this.addInfo.nickname,
            headurl: '1.png'
          }
          var _this = this;
          CGI.post(this.$store.state, 'add_user', param, function(resp) {
            if (resp.errno == 0) {
              var u = CGI.clone(param);
              u.id = resp.data.id;
              _this.infos.unshift(u);
              _this.modal.addShow = false;
            } else {
              _this.alertInfo(resp.desc);
              this.modal.addShow = false;
            }
          })
        }
      })
    },
    handleSizeChange(val) {
      console.log(`每页 ${val} 条`);
    },
    handleCurrentChange(val) {
      this.pageCfg.start = (val-1)*30;
      this.getData(false);
      console.log(`当前页: ${val}`);
    },
    alertInfo(val) {
      this.alertShow = true;
      this.alertMsg = val;
    },
    refresh() {
      this.getData(false);
    }
  },
}
</script>
<style lang="scss">
@import '../../assets/css/table.css', '../../assets/css/common.scss';
.user-table td:last-child {
  white-space: pre-wrap;
  word-wrap: break-word;
  max-width: 300px;
}
.modal-detail>div {
  padding: 10px 0;
}
.det_img {
  @include pos(top,26px, right, 37px);
}
</style>
