<style lang="scss" scope>
@import '../../assets/css/table.css';
@import '../../assets/css/common.scss';
.dropdown-menu>li>a button[disabled] {
  color: #ccc;
}
.el-icon-close:before {
 content: '';
}
.height120 {
  width: 120px;
  max-height: 120px;
  overflow: hidden;
}
</style>
<template>
  <div class="mana_container">
    <article class="module width_3_quarter">
      <header class="app_header">
        <div>
          <button type="button" class="btn btn-info btn-left outline-none">
            类型<select v-model="selected" @change="getData(true)"><option :value="{ number: 4 }">scense</option><option :value="{ number: 5 }">scensetest</option>></select></button>
          <button class="btn btn-left outline-none" @click="add">添加</button>
          <button class="btn btn-left outline-none" :disabled="selId==-1" @click="review">上线</button>
        </div>
        <div>
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
              highlight-current-row
              @row-click="chkLine">
              <el-table-column
                inline-template
                label="id">
                <div>{{row.id||'-'}}</div>
              </el-table-column>
              <el-table-column
                inline-template
                label="对应目录">
                <div>{{row.dir ||'-'}}</div>
              </el-table-column>
              <el-table-column
                inline-template
                label="版本修改描述">
                <div>{{row.description||'-'}}</div>
              </el-table-column>
              <el-table-column
                inline-template
                label="预览">
                <a :href="makeAddress(row)" target="_blank">预览</a>
              </el-table-column>
              <el-table-column
                inline-template
                label="状态">
                <div>{{row.online?'上线':'下线'}}</div>
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
        :total="pageCfg.total">
      </el-pagination>
       <div class="shade" v-if="modal.addShow">
        <div class="edit-form" style="width:600px">
          <el-form ref="form" :model="postInfo" label-width="80px">
            <el-form-item label="对应目录">
              <el-input v-model.trim="postInfo.dir"></el-input>
            </el-form-item>
            <el-form-item label="版本描述">
              <el-input type="text" v-model.number="postInfo.description"></el-input>
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
          <el-button type="primary" @click.native="onlineOps">确 定</el-button>
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
        dialogShow: false,
        addShow: false,
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
      selId: -1,
      selected: {
        number:4
      },
      tagsInfo: [],
      checkedTags: [],
      postInfo: {
        dir: '',
        description: ''
      },
      dateInfo: {
        date1: '',
        date2: ''
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
        type: this.selected.number
      }

      CGI.post(this.$store.state, 'get_portal_dir', param, (resp) => {
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
    makeAddress(row) {
      var num = this.selected.number
      var p = '';
      if (num == 4) {
        p = 'http://api.yunxingzh.com/'
      } else {
        p = 'http://wx.yunxingzh.com/'
      }
      var ret = p+row.dir+'?uid=137&token=6ba9ac5a422d4473b337d57376dd3488&ts=1487489960&portaltype=1&adtype=1&s=1#/home';
      return ret
    },
    handleSizeChange(val) {
      console.log('每页 ${val} 条');
    },
    handleCurrentChange(val) {
      this.pageCfg.start = (val-1)*30;
      this.getData();
      console.log('当前页: ${val}');
    },
    add() {
      CGI.objClear(this.postInfo);
      this.modal.addShow = true;
    },
    addPost() { 
      if (!this.postParam()) {
        return;
      }
      var param = {
        type: this.selected.number,
        dir: this.postInfo.dir,
        description: this.postInfo.description
      }
      var pass = true;
      switch (param.type) {
        case 4:
          var str = param.dir.substr(0,6);
          if (str !== 'scenes') {
            pass = false;
            this.alertInfo('请输入以scenes开头的目录名');
          } //else {}
          break;
        case 5:
          var str = param.dir.substr(0,10);
          if (str !== 'scenestest') {
            pass = false;
            this.alertInfo('请输入以scenestest开头的目录名');
          } //else {}
          break;
      }
      if (pass) {
        CGI.post(this.$store.state, 'add_portal_dir', param, (resp)=> {
          if (resp.errno === 0) {
            var u = CGI.clone(this.postInfo);
            u.id = resp.data.id;
            if (this.infos.length > 0) {
              this.infos.push(u);
            } else {
              this.infos = u;
            }         
            this.modal.addShow = false;
          } else {
            this.alertInfo(resp.desc);
          }
        })
      }
    },
    postParam() {
      var ret = true;
      if (this.postInfo.dir.length <= 0) {
        this.alertInfo('请输入对应目录');
        ret = false;
      }
      if (this.postInfo.description.length <= 0) {
        this.alertInfo('请输入版本描述');
        ret = false;
      }
      return ret;
    },
    review() {  
      this.dialogCfg.title = '上线';
      this.dialogCfg.text = '确认要上线吗';
      this.modal.dialogShow = true;
    },
    chkLine(row) {
      this.selId = row.id; 
      console.log(this.selId);    
    },
    onlineOps() {
      var param = {
        id: this.selId
      };

      CGI.post(this.$store.state, 'online_portal_dir', param, (resp)=> {
       if (resp.errno === 0) {
        this.getData();
        this.modal.dialogShow = false;
        this.selId = -1;
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
