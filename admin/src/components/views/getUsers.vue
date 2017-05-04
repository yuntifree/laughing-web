<template>
  <div class="mana_container">
    <article class="module width_3_quarter">
      <header class="app_header">
        <div>
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
              :data="users"
              :height="tableHeight"
              border>
              <el-table-column
                inline-template
                label="id">
                <div>{{row.id||'-'}}</div>
              </el-table-column>
              <el-table-column
                inline-template
                label="emie">
                <div>{{row.emie||'-'}}</div>
              </el-table-column>
              <el-table-column
                inline-template
                label="活跃时间">
                <div>{{row.active||'-'}}</div>
              </el-table-column>
              <el-table-column
                inline-template
                label="电话">
                <div>{{row.phone||'-'}}</div>
              </el-table-column>
              <el-table-column
                inline-template
                label="备注">
                <div>{{row.remark||'-'}}</div>
              </el-table-column>
              <el-table-column
                inline-template
                label="连接次数">
                <div>{{row.times||0}}</div>
              </el-table-column>
              <el-table-column
                inline-template
                label="连接时长(秒)">
                <div>{{row.duration||'0'}}</div>
              </el-table-column>
              <el-table-column
                inline-template
                label="使用流量">
                <div>{{row.emie||'-'}}</div>
              </el-table-column>
              <el-table-column
                inline-template
                label="最后连接时间">
                <div>{{row.utime||'-'}}</div>
              </el-table-column>
              <el-table-column
                inline-template
                label="最后连接地点">
                <div>{{row.address||'-'}}</div>
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
      users: [],
      columns: columns,

      selIdx: -1,
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
        seq: this.pageCfg.start || 0,
        num: 30,
      };
      CGI.post(this.$store.state, 'get_users', param, (resp) => {
        if (resp.errno === 0) {
          var data = resp.data;
          this.users = data.infos;
          this.pageCfg.total = data.total;
          this.dataReady = true;
        } else {
          this.alertInfo(resp.desc);
        }
      });
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
