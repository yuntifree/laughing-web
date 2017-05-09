<template>
  <div class="mana_container">
    <article class="module width_3_quarter">
      <header class="app_header">
        <div>
          <button type="button" class="btn btn-info btn-left outline-none">
            审核状态<select v-model="type" @change="getData(true)"><option :value="{ number: 0 }">未审核</option><option :value="{ number: 1 }">审核通过</option><option :value="{ number: 2 }">审核拒绝</option></select>
          </button>
          <button class="btn btn-default btn-sm outline-none">
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
                label="播放次数">
                <div>{{row.views||'-'}}</div>
              </el-table-column>
              <el-table-column
                inline-template
                label="图片">
                <div class="height80" ><img class="height80" :src="row.img"></div>
              </el-table-column>
              <el-table-column
                inline-template
                label="标题">
                <div>{{row.title||'-'}}</div>
              </el-table-column>
              <el-table-column
                inline-template
                label="描述">
                <div>{{row.desc||'-'}}</div>
              </el-table-column>
              <el-table-column
                inline-template
                label="分享者uid">
                <div>{{row.uid||0}}</div>
              </el-table-column>
              <el-table-column
                inline-template
                label="分享者昵称">
                <div>{{row.nickname||'-'}}</div>
              </el-table-column>
              <el-table-column
                inline-template
                label="分享者头像">
                <div><img :src="row.headurl"></div>
              </el-table-column>
              <el-table-column
                inline-template
                :context="_self"
                label="操作"
                width="100">
                <span>
                  <el-button @click="review($index,row,0)" type="text" size="small">通过</el-button>
                  <el-button @click="review($index,row,1)" type="text" size="small">拒绝</el-button>
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
      <div class="shade" v-if="modal.reviewShow" >
        <div class="edit-form" style="width:600px">
          <div class="form-title">{{modal.title}}</div>
          <el-form :model="reviewInfo" label-width="80px">
          <el-form-item label="审核" prop="reject">
              <el-radio-group 
                placeholder="操作"
                v-model="reviewInfo.reject">
                <el-radio label="0">通过</el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item 
              label="标题" 
              prop="title">
              <el-input v-model.number="reviewInfo.title" placeholder="若要修改标题，请填写标题"></el-input>
            </el-form-item>
             <el-form-item>
              <el-button type="primary" @click="reviewPost">确定</el-button>
              <el-button @click="modal.reviewShow=false">取消</el-button>
            </el-form-item>
          </el-form>
        </div>
      </div>
      <el-dialog v-model="modal.dialogShow"  :title="dialogCfg.title" size="tiny">
        <span>{{dialogCfg.text}}</span>
        <span slot="footer" class="dialog-footer">
          <el-button @click.native="modal.dialogShow = false">取 消</el-button>
          <el-button type="primary" @click.native="chkonline">确 定</el-button>
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
      modal: {
        title: '',
        reviewShow: false,
        dialogShow: false
      },
      dialogCfg: {
        title: '',
        text: ''
      },
      type: {
        number:0
      },
      reviewInfo: {
        title: '',
        reject: '0',
        modify: 0
      }
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
        seq: this.pageCfg.start || 0,
        num: 30,
        type: this.type.number
      };
      CGI.post(this.$store.state, 'get_shares', param, (resp) => {
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
    review(idx, row, reject) {
      this.selIdx = idx;
      if (!reject) {
        this.modal.title = '审核通过';
        this.reviewInfo.reject = '0';
        this.modal.reviewShow = true;
      } else {
        this.dialogCfg.title = '审核拒绝';
        this.dialogCfg.text = '确认要拒绝' + row.id +'审核吗?';
        this.modal.dialogShow = true;
      }
    },
    reviewPost() {
      var param = {
        id: this.infos[this.selIdx].id,
        reject: 0
      }
      if (this.reviewInfo.title) {
        param.modify = 1,
        param.title = this.reviewInfo.title
      }
      CGI.post(this.$store.state, 'review_share', param, (resp)=> {
        if (resp.errno == 0) {
          this.infos.splice(this.selIdx,1);
          this.reviewInfo.title = '';
          this.selIdx = -1;
          this.modal.reviewShow = false; 
        } else {
          this.alertInfo(resp.desc);
        }
      })
    },
    rejectPost() {

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
