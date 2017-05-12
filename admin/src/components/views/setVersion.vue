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
                label="版本号">
                <div>{{row.version||'-'}}</div>
              </el-table-column>
              <el-table-column
                inline-template
                label="版本名称">
                <div>{{row.vname||'-'}}</div>
              </el-table-column>
              <el-table-column
                inline-template
                label="终端">
                <div>{{row.term ? 'ios' : 'android'||'-'}}</div>
              </el-table-column>
              <el-table-column
                inline-template
                label="标题">
                <div>{{row.title||'-'}}</div>
              </el-table-column>
              <el-table-column
                inline-template
                label="副标题">
                <div>{{row.subtitle||'-'}}</div>
              </el-table-column>
              <el-table-column
                inline-template
                label="下载地址">
                <div>{{row.downurl||'-'}}</div>
              </el-table-column>
              <el-table-column
                inline-template
                label="更新说明">
                <div>{{row.desc||'-'}}</div>
              </el-table-column>
              <el-table-column
                inline-template
                :context="_self"
                label="操作"
                width="100">
                <span>
                  <el-button type="text" size="small">删除</el-button>
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
            <el-form-item label="版本号" prop="version">
              <el-input v-model.number="addInfo.version" placeholder="请填写版本号(数字）"></el-input>
            </el-form-item>
            <el-form-item label="版本名称" prop="vname">
              <el-input
                placeholder="请填写版本名称"
                v-model.trim="addInfo.vname">
              </el-input>
            </el-form-item>
            <el-form-item label="手机终端" prop="term">
              <el-radio-group 
                placeholder="请填写内部版本号"
                v-model="addInfo.term">
                <el-radio label="0">Android</el-radio>
                <el-radio label="1">Ios</el-radio>
              </el-radio-group>
            </el-form-item> 
            <el-form-item label="标题" prop="title">
              <el-input
                placeholder="请填写标题"
                v-model.trim="addInfo.title">
              </el-input>
            </el-form-item> 
            <el-form-item label="副标题" prop="subtitle">
              <el-input
                placeholder="请填写副标题"
                v-model.trim="addInfo.subtitle">
              </el-input>
            </el-form-item> 
            <el-form-item label="下载地址" prop="downurl">
              <el-input
                placeholder="请填写下载地址"
                v-model.trim="addInfo.downurl">
              </el-input>
            </el-form-item> 
            <el-form-item label="更新说明" prop="desc">
              <el-input
                placeholder="请填写更新说明"
                v-model.trim="addInfo.desc">
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
        title: '',
        delShow: false
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
        version: 0,
        vname: '',
        term: '0',
        title: '',
        subtitle: '',
        downurl: '',
        desc: ''
      },
      alertShow: false,
      alertMsg: '',
      rules: {
          version: [
            { required: true, message: '请填写版本号'},
            { type: 'number', message: '版本号必须为数字值', trigger: 'blur' }
          ],
          vname: [
            { required: true, message: '请填写版本名称', trigger: 'blur' }
          ],
          term: [
            { required: true, message: '请选择手机终端', trigger: 'change' }
          ],
          title: [
            { required: true, message: '请填写标题', trigger: 'blur' }
          ],
          subtitle: [
            { required: true, message: '请填写副标题', trigger: 'blur' }
          ],
          downurl: [
            { required: true, message: '请填写下载地址', trigger: 'blur' }
          ],
          desc: [
            { required: true, message: '请填写更新说明', trigger: 'blur' }
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

      CGI.post(this.$store.state, 'get_versions', param, (resp) => {
        if (resp.errno === 0) {
          var data = resp.data;
          if (data.infos) {
            this.infos = data.infos;
          }
          this.pageCfg.total = data.total;
          this.dataReady = true;
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
      this.getData(false);
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
          //_this.postInfo.img = _this.$store.state.imgUrl[0];
           var param = CGI.clone(this.addInfo);
           param.term = ~~param.term;
           console.log(JSON.stringify(param));
          CGI.post(this.$store.state, 'add_version', param, function(resp) {
            if (resp.errno == 0) {
                _this.alertInfo('新增成功');
                var u = CGI.clone(_this.addInfo);
                u.id= resp.data.id;
                _this.infos.unshift(u);        
                _this.modal.addShow = false;
            } else {
              _this.alertInfo(resp.desc);
            }
          })
        }//else {}
      })     
    },
    alertInfo(val) {
      this.alertShow = true;
      this.alertMsg = val;
    }
  }
}
</script>
