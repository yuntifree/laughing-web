<style lang="scss" scope>
@import '../../assets/css/table.css';
@import '../../assets/css/common.scss';
.dropdown-menu>li>a button[disabled] {
  color: #ccc;
}
.el-icon-close:before {
 content: '';
}
.el-textarea__inner {
  resize: none;
}
</style>
<template>
  <div class="mana_container">
    <article class="module width_3_quarter">
      <header class="app_header">
        <div>
          <button class="btn btn-left outline-none" @click="addAct">增加</button>
        </div>
        <div>
          <div class="quick_search">
            <i class="iconfont icon-search"></i>
            <input class="ipt-search" type="text" placeholder="ID/电话/用户名"
              v-model="search">
          </div>
          <button class="btn btn-default btn-ssm" @click="getData(0)">刷新</button>
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
                label="id">
                <div>{{row.id||'-'}}</div>
              </el-table-column>
              <el-table-column
                inline-template
                label="渠道名">
                <div>{{row.channel||'-'}}</div>
              </el-table-column>
              <el-table-column
                inline-template
                label="渠道名">
                <div>{{row.cname||'-'}}</div>
              </el-table-column>
              <el-table-column
                inline-template
                label="内部版本号">
                <div>{{row.version||'-'}}</div>
              </el-table-column>
              <el-table-column
                inline-template
                label="外部版本号">
                <div>{{row.vname||'-'}}</div>
              </el-table-column>
              <el-table-column
                inline-template
                label="下载地址">
                <div>{{row.downurl||'-'}}</div>
              </el-table-column>
              <el-table-column
                inline-template
                :context="_self"
                label="操作"
                width="100">
                <span>
                  <el-button @click="editAct($index,row)" type="text" size="small">编辑</el-button>
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
          <el-form ref="form" :model="addInfo" label-width="80px">
            <el-form-item label="渠道名(英)">
              <el-input v-model.trim="addInfo.channel" placeholder="请输入渠道名(英)"></el-input>
            </el-form-item>
            <el-form-item label="渠道名(中)">
              <el-input
                placeholder="请输入渠道名(中)"
                v-model.trim="addInfo.cname">
              </el-input>
            </el-form-item>
            <el-form-item label="内部版本号">
              <el-input
                type="number"
                placeholder="请输入内部版本号"
                v-model.trim="addInfo.version">
              </el-input>
            </el-form-item> 
            <el-form-item label="外部版本号">
              <el-input
                placeholder="请外部版本号"
                v-model.trim="addInfo.vname">
              </el-input>
            </el-form-item> 
            <el-form-item label="下载地址">
              <el-input
                placeholder="请输入下载地址"
                v-model.trim="addInfo.downurl">
              </el-input>
            </el-form-item>  
            <el-form-item>
              <el-button type="primary" @click="addPost">确定</el-button>
              <el-button @click="modal.addShow=false">取消</el-button>
            </el-form-item>
          </el-form>
        </div>
      </div>
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
export default {
  data() {
    return {
      dataReady: true,
      infos: [],
      modal: {
        addShow: false,
        editShow: false,
      },

      pageCfg: {
        total: 1,
        limit: 30,
        start: 0,
        currentPage: 1,
      },
      selIdx: -1,
      search: '',
      addInfo: {
        channel: '',
        cname: '',
        version: 0,
        vname: '',
        downurl: ''
      },
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
      if (reload) {
        this.pageCfg.currentPage = 1;
        this.pageCfg.start = 0;
      }
      var param = {
        seq: this.pageCfg.start,
        num: 30,
      }

      CGI.post(this.$store.state, 'get_channel_version', param, (resp) => {
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
    handleSizeChange(val) {
      console.log('每页 ${val} 条');
    },
    handleCurrentChange(val) {
      this.pageCfg.start = (val-1)*30;
      this.getData(false);
      console.log('当前页: ${val}');
    },
    addAct() {
      CGI.objClear(this.addInfo);
      this.modal.editShow = false;
      this.modal.addShow = true;
    },
    makeparam() {
      var ret = true;
      if (this.addInfo.channel.length <=0) {
        this.alertInfo('请输入渠道名(英)');
        ret = false;
      }
      if (this.addInfo.cname.length <=0) {
        this.alertInfo('请输入渠道名(中)');
        ret = false;
      }
      if (this.addInfo.vname.length <=0) {
        this.alertInfo('请输入外部版本号');
        ret = false;
      }
      if (this.addInfo.downurl.length <=0) {
        this.alertInfo('请输入下载地址');
        ret = false;
      }
      return ret;
    },
    addPost() {
      if (!this.makeparam()) {
        return;
      }
      var param = {};
      var action = ''
      if (this.modal.editShow) {
        param = this.addInfo
        param.id = this.infos[this.selIdx].id;
        action = 'mod_channel_version';
      } else {
        param = CGI.objModified(this.infos[this.selIdx], this.addInfo);
        action = 'add_channel_version';
      }
      CGI.post(this.$store.state, action, param, (resp)=> {
        if (resp.errno == 0) {
          if (this.modal.editShow) {
            this.alertInfo('修改成功');
            CGI.extend(this.infos[this.selIdx], this.addInfo);
            this.selIdx = -1;
          } else {
            this.alertInfo('新增成功');
            var u = CGI.clone(this.addInfo);
            u.id= resp.data.id;
            this.infos.unshift(this.addInfo);
          }         
          this.modal.addShow = false;
        } else {
          this.alertInfo(resp.desc);
        }
      })        
    },
    editAct(idx, row) {
      this.selIdx = idx;
      CGI.extend(this.addInfo, row);
      this.modal.editShow = true;
      this.modal.addShow = true;
    },
    alertInfo(val) {
      this.alertShow = true;
      this.alertMsg = val;
    }
  }
}
</script>
