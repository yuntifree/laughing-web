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
                label="热推">
                <div>{{row.recommend ? '是' : '-'}}</div>
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
              <el-table-column
                inline-template
                :context="_self"
                label="操作"
                width="100">
                <span>
                  <el-button @click="editUser($index,row)" type="text" size="small">编辑</el-button>
                </span>
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
            <el-form-item label="热门推荐" prop="recommend">
              <el-radio-group 
                v-model="addInfo.recommend">
                <el-radio label="1">是</el-radio>
                <el-radio label="0">否</el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item label="头像">
              <uploader></uploader>
            </el-form-item>
            <el-form-item>
              <el-button v-if="modal.editShow" type="primary" @click="editPost">确定</el-button>
              <el-button v-else type="primary" @click="addPost">确定</el-button>
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
var URL = 'http://laugh.us-ca.ufileos.com/'
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
      selIdx: -1,
      alertShow: false,
      alertMsg: '',
      addInfo: {
        nickname: '',
        recommend: '0',
        headurl: ''
      },
      modal: {
        title: '',
        addShow: false,
        editShow: false
      },
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
          if (data.infos && data.infos.length >0) {
            this.infos = data.infos;
            this.infos.forEach(function(item) {
              if (!item.recommend) {
                item.recommend = 0;
              }
            })
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
      this.addInfo.recommend = '0';
      this.modal.addShow = true;
    },
    addPost() {
      this.$refs['ruleForm'].validate((valid)=> {
        if (valid) {
            var param = CGI.clone(this.addInfo);
            param.recommend = ~~param.recommend;
            param.headurl = this.$store.state.imgUrl;
            var _this = this;
          CGI.post(this.$store.state, 'add_user', param, function(resp) {
            if (resp.errno == 0) {
              var u = CGI.clone(param);
              u.id = resp.data.id;
              u.headurl = URL +param.headurl;
              _this.infos.unshift(u);
              _this.modal.addShow = false;
            } else {
              _this.alertInfo(resp.desc);
              _this.modal.addShow = false;
            }
          })
        }
      })
    },
    editUser(idx,row) {
      this.selIdx = idx;
      this.modal.title = '编辑';
      var u = CGI.clone(row);
      if (u.recommend) {
        u.recommend = u.recommend.toString();
      } else {
        u.recommend = '0';
      }
      CGI.extend(this.addInfo, u);
      this.modal.editShow = true;
      this.modal.addShow = true;
    },
    editPost() {
      var _this = this;
      this.$refs['ruleForm'].validate((valid)=> {
        if (valid) {
          var param = CGI.clone(this.addInfo);
          param.recommend = ~~param.recommend;
          param.id = this.infos[this.selIdx].id;
          if (this.$store.state.imgUrl.length>0 && param.headurl !== this.$store.state.imgUrl){
            param.headurl = this.$store.state.imgUrl;
          }
          CGI.post(this.$store.state, 'mod_user', param, function(resp) {
            if (resp.errno == 0) {
              if (_this.$store.state.imgUrl.length > 0) {
                param.headurl = URL + param.headurl;
              }
              CGI.extend(_this.infos[_this.selIdx], param);
              _this.$store.state.imgUrl = '';
              _this.modal.editShow = false;
              _this.modal.addShow = false;
              _this.selIdx = -1;
            } else {
              _this.alertInfo(resp.desc);
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
