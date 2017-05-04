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
                label="标签ID">
                <div>{{row.key||'-'}}</div>
              </el-table-column>
              <el-table-column
                inline-template
                label="内容">
                <div>{{row.val||'-'}}</div>
              </el-table-column>
              <el-table-column
                inline-template
                :context="_self"
                label="操作"
                width="100">
                <span>
                  <el-button @click="editAct($index,row)" type="text" size="small">编辑</el-button>
                  <el-button @click="delAct($index,row)" type="text" size="small">删除</el-button>
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
            <el-form-item label="name">
              <el-input v-model.trim="addInfo.key" placeholder="请输入名称"></el-input>
            </el-form-item>
            <el-form-item label="value">
              <el-input
                type="textarea"
                placeholder="请输入内容"
                :autosize="{ minRows: 2, maxRows: 4}"
                v-model.trim="addInfo.val">
              </el-input>
            </el-form-item> 
            <el-form-item>
              <el-button type="primary" @click="addPost">确定</el-button>
              <el-button @click="modal.addShow=false">取消</el-button>
            </el-form-item>
          </el-form>
        </div>
      </div>
      <!--dialog-->
      <el-dialog v-model="modal.dialogShow"  :title="dialogCfg.title" size="tiny">
        <span>{{dialogCfg.text}}</span>
        <span slot="footer" class="dialog-footer">
          <el-button @click.native="modal.dialogShow = false">取 消</el-button>
          <el-button type="primary" @click.native="delPost">确 定</el-button>
        </span>
      </el-dialog>
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
        dialogShow: false,
      },
      dialogCfg: {
        title: '',
        text: '',
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
        key: '',
        val: ''
      },
      acrInfo: {},
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

      CGI.post(this.$store.state, 'get_conf', param, (resp) => {
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
      console.log(`每页 ${val} 条`);
    },
    handleCurrentChange(val) {
      this.pageCfg.start = (val-1)*30;
      this.getData(false);
      console.log(`当前页: ${val}`);
    },
    addAct() {
      CGI.objClear(this.addInfo);
      this.modal.editShow = false;
      this.modal.addShow = true;
    },
    addPost() {
      var param = {};
      param = this.addInfo;
      var objVal;
      if (this.addInfo.key.length <=0) {
        this.alertInfo('请输入name');
        return;
      }
      if (this.addInfo.val.length <=0) {
        this.alertInfo('请输入内容');
        return;
      }
      try {
        objVal = JSON.parse(this.addInfo.val)  
      } catch(e) {
        objVal = null;
      }
      if (objVal) {
        CGI.post(this.$store.state, 'set_conf', param, (resp)=> {
          if (resp.errno == 0) {
            if (this.modal.editShow) {
              this.alertInfo('修改成功');
              CGI.extend(this.infos[this.selIdx], this.addInfo);
              this.selIdx = -1;
            } else {
              this.alertInfo('新增成功');
              this.infos.unshift(this.addInfo);
            }         
            this.modal.addShow = false;
          } else {
            this.alertInfo(resp.desc);
          }
        })        
      } else {
        this.alertInfo('请输入正确JSON格式');
      }
    },
    editAct(idx, row) {
      this.selIdx = idx;
      CGI.extend(this.addInfo, row);
      this.modal.editShow = true;
      this.modal.addShow = true;
    },
    delAct(idx, row) {
      this.selIdx = idx;
      this.dialogCfg.title = '删除';
      this.dialogCfg.text = '确认要删除' + row.key;
      this.actInfo = CGI.clone(row);
      this.modal.dialogShow = true;
    },
    delPost() {
      var keys = [];
      keys.push(this.actInfo.key);
      var param = {
        keys: keys
      }
      CGI.post(this.$store.state, 'del_conf', param, (resp)=> {
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
    alertInfo(val) {
      this.alertShow = true;
      this.alertMsg = val;
    }
  }
}
</script>
