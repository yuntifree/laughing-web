<style lang="scss" scope>
@import '../../assets/css/table.css';
@import '../../assets/css/common.scss';
/* .edit-form {
  max-width:600px;
  width: 80%;
  height: 60%;
} */
.form-title {
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
                label="广告业主id">
                <div>{{row.id||'-'}}</div>
              </el-table-column>
              <el-table-column
                inline-template
                label="广告合作方">
                <div>{{row.name||'-'}}</div>
              </el-table-column>
              <el-table-column
                inline-template
                label="联系人">
                <div>{{row.contact||'-'}}</div>
              </el-table-column>
              <el-table-column
                inline-template
                label="联系电话">
                <div>{{row.phone||'-'}}</div>
              </el-table-column>
              <el-table-column
                inline-template
                label="公司地址">
                <div>{{row.address||'-'}}</div>
              </el-table-column>
              <el-table-column
                inline-template
                label="合作开始日期">
                <div>{{makeTime(row.atime)||'-'}}</div>
              </el-table-column>
              <el-table-column
                inline-template
                label="合作到期日期">
                <div>{{makeTime(row.etime) || '-'}}</div>
              </el-table-column>
              <el-table-column
                inline-template
                label="创建时间">
                <div>{{row.ctime || '-'}}</div>
              </el-table-column>
              <el-table-column
                inline-template
                :context="_self"
                label="操作"
                width="100">
                <span>
                  <el-button @click="edit($index,row)" type="text" size="small">修改</el-button>
                  <el-button @click="del($index,row)" type="text" size="small">删除</el-button>
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
        <div class="edit-form">
          <div class="form-title">增加</div>
          <el-form :model="postInfo" :rules="rules" ref="form" label-width="100px" class="demo-ruleForm">
            <el-form-item label="广告业主" prop="name">
              <el-input  v-model.trim="postInfo.name" placeholder="请输入广告业主"></el-input>
            </el-form-item>
            <el-form-item label="联系人" prop="contact">
              <el-input  v-model.trim="postInfo.contact" placeholder="请输入联系人"></el-input>
            </el-form-item>
            <el-form-item label="联系号码" prop="phone" ref="phone">
              <el-input  v-model.trim="postInfo.phone" placeholder="请输入联系号码"></el-input>
            </el-form-item>
            <el-form-item label="公司地址" prop="address">
              <el-input  v-model.trim="postInfo.address" placeholder="请输入公司地址"></el-input>
            </el-form-item>
            <el-form-item label="生效时间" prop="atime">
              <el-date-picker
                v-model="postInfo.atime"
                type="datetime"
                placeholder="请选择生效时间">
              </el-date-picker>
            </el-form-item>
            <el-form-item label="失效时间">
              <el-date-picker
                v-model="postInfo.etime"
                type="datetime"
                placeholder="请选择失效时间">
              </el-date-picker>
            </el-form-item>
            <el-form-item label="备注" prop="remark">
              <el-input  v-model.trim="postInfo.remark" placeholder="请输入备注信息"></el-input>
            </el-form-item>
            <el-form-item>
              <div class="btn-click">
                <el-button v-if="modal.addShow" type="primary" @click="addPost('form')">确定</el-button>
                <el-button v-else type="primary" @click="editPost('form')">确定</el-button>
                <el-button @click="modal.editShow=false">取消</el-button>
              </div>
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
        name: '',
        contact: '',
        phone: '',
        address: '',
        atime: '',
        etime: '',
        remark: '',
      },
      reviewOps: 0,
      alertShow: false,
      alertMsg: '',
      addParam: {},
      rules: {
        name: [
          { required: true, message: '请输入名称', trigger: 'blur' },
        ],
        contact: [
          { required: true, message: '请输入联系人', trigger: 'blur' }
        ],
        phone: [
          { required: true, message: '请输入电话号码', trigger: 'blur' }
        ],
        address: [
          { required: true, message: '请输入联系人', trigger: 'blur' }
        ],
        abstract: [
          { required: true, message: '请输入电话号码', trigger: 'blur' }
        ],
        content: [
          { required: true, message: '请输入地址信息', trigger: 'change' }
        ],
        atime: [
          { type: 'date', required: true, message: '请选择生效时间', trigger: 'blur'}
        ]
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
      if (reload) {
        this.pageCfg.currentPage = 1;
        this.pageCfg.start = 0;
      }
      var param = {
        seq: this.pageCfg.start,
        num: 30,
      }

      CGI.post(this.$store.state, 'get_customer', param, (resp) => {
        if (resp.errno === 0) {
          var data = resp.data;
          this.infos = data.infos;
          if (!this.infos) {
            this.infos = [];
          }
          this.dataReady = true;
        } else {
          this.alertInfo(resp.desc);
        }
      });
    },
    makeTime(time) {
      var t = CGI.dateFormat(time, 'yyyy-MM-dd hh:mm:ss');
      return t;
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
      this.modal.editShow = true;
    },
    edit(idx,row) {
      this.selIdx = idx;
      this.modal.addShow = false;
      CGI.objClear(this.postInfo);
      CGI.extend(this.postInfo,row);
      this.modal.editShow = true;
    },
    editPost() { 
      var param = CGI.clone(this.postInfo);        
      param.id = this.infos[this.selIdx].id; 
      CGI.post(this.$store.state, 'mod_customer', param, (resp)=> {
        console.log(JSON.stringify(resp));
        if (resp.errno === 0) {
          CGI.extend(this.infos[this.selIdx], this.postInfo);
          this.modal.editShow = false;
          this.selIdx = -1;
        } else {
          this.alertInfo(resp.desc);
        }
      })
    },
    addPost(formName) {
      var _this = this;
      this.$refs[formName].validate((valid) => {
        if (valid) {
          var param = CGI.clone(this.postInfo);
          param.atime = CGI.dateFormat(param.atime, 'yyyy-MM-dd hh:mm:ss');
          if(param.etime) {
            param.etime = CGI.dateFormat(param.etime, 'yyyy-MM-dd hh:mm:ss');
          }
          param.ctime = CGI.dateFormat(new Date(), 'yyyy-MM-dd hh:mm:ss');
          if (CGI.checkTel(param.phone)) {
            CGI.post(this.$store.state, 'add_customer', param, function(resp){
              if (resp.errno === 0) {
                var u = CGI.clone(param);
                u.id = resp.data.id;
                _this.infos.push(u);
                _this.modal.editShow = false;
              } else {
                this.alertInfo(resp.desc);
              }
            })
          } else {
            this.alertInfo('请输入正确的电话号码');
            this.postInfo.phone = '';
          }
        } else {
          return false;
        }
      });
    }, 
    del(idx,row) {
      this.selIdx = idx;
      this.dialogCfg.title = '删除';
      this.dialogCfg.text = '确认要删除' + row.name;
      this.modal.dialogShow = true; 
    },
    delPost() {
      var param = this.infos[this.selIdx];
      param.deleted = 1;
      CGI.post(this.$store.state, 'mod_customer', param, (resp)=> {
        if (resp.errno === 0) {
          this.infos.splice(this.selIdx,1);
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
