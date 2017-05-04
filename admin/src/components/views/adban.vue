<template>
  <div class="mana_container">
    <article class="module width_3_quarter">
      <header class="app_header">
        <div>
          <button class="btn btn-default btn-sm outline-none" @click="addAds">
          <i class="iconfont icon-add"></i>添加
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
                label="term">
                <div>{{row.term ? 'ios' : 'android' ||'-'}}</div>
              </el-table-column>
              <el-table-column
                inline-template
                label="version">
                <div>{{row.version ||'-'}}</div>
              </el-table-column>
              <el-table-column
                inline-template
                :context="_self"
                label="操作"
                width="100">
                <span>
                  <el-button @click="delAds($index,row)" type="text" size="small">删除</el-button>
                </span>
              </el-table-column>
            </el-table>
          </template>
        </div>
      </div>
      <!--翻页-->
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
          <el-form ref="form" :model="addInfo" label-width="80px">
            <el-form-item label="终端">
              <input type="radio" id="one" value="0" v-model="addInfo.term">
              <label for="one">android</label>
              <input type="radio" id="two" value="1" v-model="addInfo.term">
              <label for="two">ios</label>
            </el-form-item>
            <el-form-item label="version">
              <el-input type="number" v-model="addInfo.version"></el-input>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="addPost()">确定</el-button>
              <el-button @click="modal.addShow=false">取消</el-button>
            </el-form-item>
          </el-form>
        </div>
      </div>
      <el-dialog v-model="modal.dialogShow"  :title="dialogCfg.title" size="tiny">
        <span>{{dialogCfg.text}}</span>
        <span slot="footer" class="dialog-footer">
          <el-button @click.native="modal.dialogShow = false">取 消</el-button>
          <el-button type="primary" @click.native="delPost">确 定</el-button>
        </span>
      </el-dialog>

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
import md5 from 'md5'

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

      modal: {
        addShow: false,
        dialogShow: false,
      },
      dialogCfg: {
        title: '',
        text: '',
      },
      selIdx: -1,
      alertShow: false,
      alertMsg: '',
      addInfo: {
        term: 0,
        version: 0.0,
      },
      delInfo: {},
      alertShow: false,
      alertMsg: '',
    }
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
        type: 0,
        seq: this.pageCfg.start || 0,
        num: 30,
      };
      CGI.post(this.$store.state, 'get_adban', param, (resp) => {
        if (resp.errno === 0) {
          var data = resp.data;
          this.infos = data.infos;
          this.pageCfg.total = data.total;
          this.dataReady = true;
        } else {
          this.alertInfo(resp.desc);
        }
      });
    },
    addAds() {
      CGI.objClear(this.addInfo);
      this.modal.addShow = true;
    },
    addPost() {
      if (this.addInfo.version.length <=0) {
        this.alertInfo('请输入版本号');
        return;
      } else {
        this.addInfo.version = ~~this.addInfo.version;
      }
      var param = this.addInfo;
      CGI.post(this.$store.state, 'add_adban', param, (resp)=> {
        if (resp.errno == 0) {
          this.alertInfo('新增成功');
          this.addInfo.id = resp.data.id;
          this.infos.unshift(this.addInfo);
          this.modal.addShow = false;
        } else {
          this.alertInfo(resp.desc);
        }
      })
    },
    delAds(idx, row) {
      this.selIdx = idx;
      this.dialogCfg.title = '删除';
      this.dialogCfg.text = '确认要删除' + row.id;
      this.delInfo = CGI.clone(row);
      this.modal.dialogShow = true;
    },
    delPost() {
      var ids = [];
      ids.push(this.delInfo.id);
      var param = {
        ids: ids
      }
      CGI.post(this.$store.state, 'del_adban', param, (resp)=> {
        if (resp.errno === 0) {
          this.infos.splice(this.selIdx, 1);
          this.modal.dialogShow = false;
          this.alertInfo('删除成功');
          this.selIdx = -1;
        } else {
          this.alertInfo(resp.desc);
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
