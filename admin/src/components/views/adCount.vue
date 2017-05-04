<style lang="scss" scope>
@import '../../assets/css/table.css';
@import '../../assets/css/common.scss';
/* .edit-form {
  max-width:600px;
  width: 80%;
  height: 60%;
}
 */.form-title {
  width: 100%;
  border-bottom: 1px solid #ccc;
  line-height: 40px;
  margin-bottom: 10px;
  font-weight: bold;
}

</style>
<template>
  <div class="mana_container">
    <article class="module width_3_quarter">
      <header class="app_header">
        <div>
          <button class="btn btn-default btn-ssm" @click="getData(true)">刷新</button>
        </div>
      </header>
      <div class="tab_container" ref="tableContent">
        <div id="tab1" class="tab_content tab-fixed" v-if="dataReady">
          <template>
            <el-table
              :data="infos"
              :height="tableHeight"
              border
              highlight-current-row>
              <el-table-column
                inline-template
                label="点击id">
                <div>{{row.id||'-'}}</div>
              </el-table-column>
              <el-table-column
                inline-template
                label="广告id">
                <div>{{row.aid||'-'}}</div>
              </el-table-column>
              <el-table-column
                inline-template
                label="广告标题">
                <div>{{row.name||'-'}}</div>
              </el-table-column>
              <el-table-column
                inline-template
                label="用户id">
                <div>{{row.uid||'-'}}</div>
              </el-table-column>
              <el-table-column
                inline-template
                label="用户手机号">
                <div>{{row.phone||'-'}}</div>
              </el-table-column>
              <el-table-column
                inline-template
                label="用户mac">
                <div>{{row.usermac||'-'}}</div>
              </el-table-column>
              <el-table-column
                inline-template
                label="用户ip">
                <div>{{row.userip || '-'}}</div>
              </el-table-column>
              <el-table-column
                inline-template
                label="点击时间">
                <div>{{row.ctime ? '上线' : '下线'}}</div>
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
      <!--alert-->
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
export default {
  data() {
    return {
      dataReady: true,
      infos: [],
      pageCfg: {
        total: 1,
        limit: 30,
        start: 0,
        currentPage: 1,
      },
      alertShow: false,
      alertMsg: '',
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
      if (reload) {
        this.pageCfg.currentPage = 1;
        this.pageCfg.start = 0;
      }
      var param = {
        seq: this.pageCfg.start,
        num: 30,
      }

      CGI.post(this.$store.state, 'get_ad_click', param, (resp) => {
        if (resp.errno === 0) {
          var data = resp.data;
          this.infos = data.infos;
          if (!this.infos) {
            this.infos = [];
          } else if (this.infos && this.infos.length > 0) {
            this.infos.forEach(function(item) {
              if (!item.online) {
                item.online = 0
              }
              if (!item.deleted) {
                item.deleted = 0;
              }
            })
          }
          this.dataReady = true;
        } else {
          this.alertInfo(resp.desc);
        }
      });
    },
    handleSizeChange(val) {
      console.log('每页 ${val} 条');
    },
    handleCurrentChange(val) {
      this.pageCfg.start = (val-1)*30;
      this.getData(false);
      console.log('当前页: ${val}');
    },
    alertInfo(val) {
      this.alertShow = true;
      this.alertMsg = val; 
    }
  }
}
</script>
