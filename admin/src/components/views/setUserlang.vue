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
          <!--div class="quick_search">
            <i class="iconfont icon-search"></i>
            <input class="ipt-search" type="text" placeholder="ID/电话/用户名"
              v-model="search">
          </div-->
          <button class="btn btn-default btn-ssm" @click="getData()">刷新</button>
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
                label="语言id">
                <div>{{row.lid||'-'}}</div>
              </el-table-column>
              <el-table-column
                inline-template
                label="语言">
                <div>{{row.lang||'-'}}</div>
              </el-table-column>
              <el-table-column
                inline-template
                label="备注">
                <div>{{row.content||'-'}}</div>
              </el-table-column>
              <el-table-column
                inline-template
                label="用户id">
                <div>{{row.uid||'-'}}</div>
              </el-table-column>
              <el-table-column
                inline-template
                label="头像">
                <div class="height80" ><img class="height80" :src="row.img"></div>
              </el-table-column>
              <el-table-column
                inline-template
                label="昵称">
                <div>{{row.nickname||'-'}}</div>
              </el-table-column>
               <el-table-column
                inline-template
                :context="_self"
                label="操作"
                width="100">
                <span>
                  <el-button type="text" size="small" @click="del($index,row)">删除</el-button>
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
          <el-form :model="addInfo" :rules="rules" ref="ruleForm" label-width="100px">
            <el-form-item label="lid" prop="lid">
              <el-select v-model.number="addInfo.lid" placeholder="请选择">
                <el-option
                  v-for="item in options"
                  :key="item.id"
                  :label="item.content"
                  :value="item.id">
                </el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="uids" prop="uids">
              <el-input
                placeholder="请填写用户id，多个id用','隔开"
                v-model.trim="addInfo.uids">
              </el-input>
            </el-form-item>  
            <el-form-item>
              <el-button v-if="modal.editShow" type="primary" @click="editPost">确定</el-button>
              <el-button v-else type="primary" @click="addPost">确定</el-button>
              <el-button @click="modal.addShow=false">取消</el-button>
            </el-form-item>
          </el-form>
        </div>
      </div>
       <el-dialog v-model="modal.dialogShow"  :title="dialogCfg.title" size="tiny">
        <span>{{dialogCfg.text}}</span>
        <span slot="footer" class="dialog-footer">
          <el-button type="primary" @click.native="delPost">确 定</el-button>
          <el-button @click.native="modal.dialogShow = false">取 消</el-button>
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
        title: '',
        dialogShow: false,
        editShow: false
      },

      pageCfg: {
        total: 1,
        limit: 30,
        start: 0,
        currentPage: 1,
      },
      selIdx: -1,
      search: '',
      options: [],
      addInfo: {
        lid: Number,
        uids: ''
      },
      alertShow: false,
      alertMsg: '',
      dialogCfg: {
        title: '',
        text: ''
      },
      rules: {
          lid: [
            { type: 'number',required: true, message: '请选择语言类型', trigger: 'change' }
          ],
          uids: [
            { required: true, message: '请填写用户id', trigger: 'blur' }
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
    this.getData();
    this.getLang();
  },
  methods: {
    getData() {
      CGI.post(this.$store.state, 'get_user_lang_follow', {}, (resp) => {
        if (resp.errno === 0) {
          var data = resp.data;
          if (data.infos && data.infos.length>0) {
            this.infos = data.infos;
          }
          this.pageCfg.total = data.total;
          this.dataReady = true;
        } else if (resp.errno === 999){
          console.log('暂时没有任何数据');
        } else {
          this.alertInfo(resp.desc);
        }
      })
    },
    getLang() {
      CGI.post(this.$store.state, 'get_user_lang', {}, (resp) => {
        if (resp.errno === 0) {
          var data = resp.data;
          if (data.infos && data.infos.length>0) {
            this.options = data.infos;
          }
        } else if (resp.errno === 999){
          console.log('暂时没有任何语言数据');
        } else {
          this.alertInfo(resp.desc);
        }
      }) 
    },
    handleSizeChange(val) {
      console.log('每页 ${val} 条');
    },
    handleCurrentChange(val) {
      this.pageCfg.start = (val-1)*30;
      this.getData();
      console.log('当前页: ${val}');
    },
    addAct() {
      CGI.objClear(this.addInfo);
      this.modal.title = '添加';
      this.addInfo.version = 0;
      this.addInfo.term = '0';
      this.modal.addShow = true;
    },
    addPost() {
      var _this = this;
      this.$refs['ruleForm'].validate((valid) => {
        if (valid) {
          var uids = [];
          uids = this.addInfo.uids.split(',');
          if (uids.length > 0) {
            for(var i=0; i<uids.length; i++) {
              if (~~uids[i]) {
                uids[i] = ~~uids[i];
                console.log(uids[i]);
              } else if (~~uids[i] == 0){
                this.alertInfo('请输入正确的uids,多个uids用英文逗号隔开')
              } else {
                this.alertInfo('uids请输入数字')
              }
            }
          }
           var param = {
            lid: this.addInfo.lid,
            uids: uids
           };
          CGI.post(this.$store.state, 'add_user_lang_follow', param, function(resp) {
            if (resp.errno == 0) {
                _this.alertInfo('新增成功');
                _this.modal.addShow = false;
                _this.getData();
            } else {
              _this.alertInfo(resp.desc);
            }
          })
        }//else {}
      })     
    },
    del(idx, row) {
      this.selIdx = idx;
      this.dialogCfg.title= '删除';
      this.dialogCfg.text = '确认要删除' + row.id +'吗？';
      this.modal.dialogShow = true;
    },
    delPost() {
          //_this.postInfo.img = _this.$store.state.imgUrl[0];
      var ids = [];
      ids.push(this.infos[this.selIdx].id);
      var param = {
        ids: ids
      };
      CGI.post(this.$store.state, 'del_user_lang_follow', param, (resp)=> {
        if (resp.errno == 0) {
          this.infos.splice(this.selIdx,1);
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
