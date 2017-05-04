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
            类型<select v-model="selected" @change="getData(true)"><option :value="{ number: 0 }">menu</option><option :value="{ number: 1 }">tab</option></select></button>
          <button class="btn btn-left outline-none" @click="add">添加</button>
        </div>
        <div>
          <button class="btn btn-default btn-ssm" @click="getData(false)">刷新</button>
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
                label="text">
                <div>{{row.text||'-'}}</div>
              </el-table-column>
              <el-table-column
                inline-template
                label="name">
                <div>{{row.name||'-'}}</div>
              </el-table-column>
              <el-table-column
                inline-template
                label="图片"
                v-if="!selected.number">
                <div>
                  <img v-if="row.icon" style="width:50px;height:auto;" :src="row.icon">
                  <span v-else>-</span>
                </div>
              </el-table-column>
              <el-table-column
                inline-template
                label="routername">
                <div>{{row.routername || '-'}}</div>
              </el-table-column>
              <el-table-column
                inline-template
                label="url">
                <div>{{row.url || '-'}}</div>
              </el-table-column>
              <el-table-column
                inline-template
                label="优先级">
                <div>{{row.priority}}</div>
              </el-table-column>
              <el-table-column
                inline-template
                label="测试">
                <div>{{row.dbg ? '是' : '否'}}</div>
              </el-table-column>
              <el-table-column
                inline-template
                label="状态">
                <div>{{row.deleted ? '下线':'上线'}}</div>
              </el-table-column>
              <el-table-column
                inline-template
                :context="_self"
                label="操作"
                width="100">
                <span>
                  <el-button @click="edit($index,row)" type="text" size="small">编辑</el-button>
                  <el-button @click="review($index,row,0)" v-show="row.deleted" type="text" size="small">上线</el-button>
                  <el-button @click="review($index,row,1)" v-show="!row.deleted" type="text" size="small">下线</el-button>
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
      <div class="shade" v-if="modal.editShow">
        <div class="edit-form" style="width:600px">
          <el-form ref="form" :model="postInfo" label-width="80px">
            <el-form-item label="text">
              <el-input  v-model.trim="postInfo.text" placeholder="请输入内容"></el-input>
            </el-form-item>
            <el-form-item label="name">
              <el-input v-model.trim="postInfo.name"></el-input>
            </el-form-item>
            <el-form-item label="icon" v-if="selected.number == 0">
              <el-input v-model.trim="postInfo.icon"></el-input>
            </el-form-item>
            <el-form-item label="routername" v-if="postInfo.routername">
              <el-input v-model.trim="postInfo.routername"></el-input>
            </el-form-item>
            <el-form-item label="url" v-if="postInfo.url">
              <el-input v-model.trim="postInfo.url"></el-input>
            </el-form-item>
            <el-form-item label="优先级">
              <el-input type="number" v-model.number="postInfo.priority"></el-input>
            </el-form-item>
            <el-form-item label="测试">
              <el-radio-group v-model="postInfo.dbg">
                <el-radio label="1">是</el-radio>
                <el-radio label="0">否</el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item label="状态">
              <el-radio-group v-model="postInfo.deleted">
                <el-radio label="1">下线</el-radio>
                <el-radio label="0">上线</el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="editPost">确定</el-button>
              <el-button @click="modal.editShow=false">取消</el-button>
            </el-form-item>
          </el-form>
        </div>
      </div>
      <div class="shade" v-if="modal.addShow">
        <div class="edit-form" style="width:600px">
          <el-form ref="form2" :model="postInfo" label-width="80px">
            <el-form-item label="text">
              <el-input  v-model.trim="postInfo.text" placeholder="请输入menu描述"></el-input>
            </el-form-item>
            <el-form-item label="name">
              <el-input v-model.trim="postInfo.name" placeholder="请输入名字"></el-input>
            </el-form-item>
            <el-form-item label="icon" v-if="selected.number == 0">
              <el-input v-model.trim="postInfo.icon"  placeholder="请输入图标地址"></el-input>
            </el-form-item>
            <el-form-item label="routername">
              <el-input v-model.trim="postInfo.routername"  placeholder="请输入路由名称"></el-input>
            </el-form-item>
            <el-form-item label="url">
              <el-input v-model.trim="postInfo.url"  placeholder="请输入跳转地址"></el-input>
            </el-form-item>
            <el-form-item label="优先级">
              <el-input type="number" v-model.number="postInfo.priority"  placeholder="请输入优先级"></el-input>
            </el-form-item>
            <el-form-item label="测试">
              <el-radio-group v-model="postInfo.dbg">
                <el-radio label="1">是</el-radio>
                <el-radio label="0">否</el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item label="状态">
              <el-radio-group v-model="postInfo.deleted">
                <el-radio label="1">下线</el-radio>
                <el-radio label="0">上线</el-radio>
              </el-radio-group>
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
        editShow: false,
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
      selIdx: -1,
      selected: {
        number:0
      },
      postInfo: {
        text: '',
        name: '',
        icon: '',
        routername: '',
        url: '',
        priority: 0, 
        dbg: '1',
        deleted: '1',
      },
      reviewOps: 0,
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

      CGI.post(this.$store.state, 'get_portal_menu', param, (resp) => {
        if (resp.errno === 0) {
          var data = resp.data;
          this.infos = data.infos;
          this.infos.forEach((item, idx)=> {
            if(!item['deleted']) {
              item.deleted = 0
            }
            if(!item['dbg']) {
              item.dbg = 0
            }
          })
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
    add() {
      CGI.objClear(this.postInfo);
      this.modal.addShow = true;
    },
    edit(idx,row) {
      this.selIdx = idx;
      CGI.objClear(this.postInfo);
      row.dbg = row.dbg.toString();
      row.deleted = row.deleted.toString();
      CGI.extend(this.postInfo,row);
      console.log(JSON.stringify(this.postInfo));
      this.modal.editShow = true;
    },
    editPost() { 
      if (!this.postParam()) {
        return;
      }
      var param = CGI.objModified(this.infos[this.selIdx], this.postInfo);        
      param.id = this.infos[this.selIdx].id; 
      param.dbg = ~~param.dbg;
      param.deleted = ~~param.deleted;
      CGI.post(this.$store.state, 'mod_portal_menu', param, (resp)=> {
        if (resp.errno === 0) {
          CGI.extend(this.infos[this.selIdx], this.postInfo);
          this.modal.editShow = false;
          this.selIdx = -1;
        } else {
          this.alertInfo(resp.desc);
        }
      })
    },
    postParam() {
      var ret = true;
      if (this.postInfo.text.length <= 0) {
        this.alertInfo('请输入text');
        ret = false;
      }
      if (this.postInfo.name.length <= 0) {
        this.alertInfo('请输入名字');
        ret = false;
      }
      if (!this.selected.number && this.postInfo.icon.length <= 0) {
        this.alertInfo('请输入图标地址');
        ret = false;
      } 
      if (this.postInfo.routername.length <= 0 && this.postInfo.url.length <= 0) {
        this.alertInfo('请输入routername或者url');
        ret = false;
      } 
      if (this.modal.addShow) {
        if (this.postInfo.routername.length > 0 && this.postInfo.url.length > 0) {
          this.alertInfo('routername和url只能输入一个');
          ret = false;
        }
      }  
      if (this.postInfo.priority.length <= 0) {
        this.alertInfo('请输入优先级');
        ret = false;
      }  
      return ret;
    },
    addPost() {
      if (!this.postParam()) {
        return;
      }
      var param = this.postInfo;
      param.dbg = ~~param.dbg;
      param.priority = ~~param.priority;
      param.deleted = ~~param.deleted;
      param.type = this.selected.number;
      CGI.post(this.$store.state, 'add_portal_menu', param, (resp)=>{
        if (resp.errno === 0) {
          var u = CGI.clone(this.postInfo);
          u.id = resp.data.id;
          this.infos.push(u);
          this.modal.addShow = false;
        } else {
          this.alertInfo(resp.desc);
        }
      })
    },  
    review(idx,row,ops) {
      this.selIdx = idx;
      var title = '';
      var text = '';
      if (ops) {
        title = '下线';
        text = '确认要下线吗'; 
      } else {
        title = '上线';
        text = '确认要上线吗';
      }
      this.dialogCfg.title = title;
      this.dialogCfg.text = text;
      this.reviewInfo = row;
      this.reviewOps = ops;
      this.modal.dialogShow = true;
    },
    onlineOps() {
      var param = {
        id: this.reviewInfo.id,
        deleted: this.reviewOps,
        dbg: this.reviewInfo.dbg || 0
      };
      CGI.post(this.$store.state, 'mod_portal_menu', param, (resp)=> {
        if (resp.errno === 0) {
          this.infos[this.selIdx].deleted = param.deleted;           
          this.modal.dialogShow = false;
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
