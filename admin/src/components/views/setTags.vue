<style lang="scss" scope>
@import '../../assets/css/table.css';
@import '../../assets/css/common.scss';
.dropdown-menu>li>a button[disabled] {
  color: #ccc;
}
.el-icon-close:before {
 content: '';
}
</style>
<template>
  <div class="mana_container">
    <article class="module width_3_quarter">
      <header class="app_header">
        <div>
          <button class="btn btn-left outline-none" @click="addtags">增加</button>
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
              :data="tags"
              :height="tableHeight"
              border
              highlight-current-row>
              <el-table-column
                inline-template
                label="标签ID">
                <div>{{row.id||'-'}}</div>
              </el-table-column>
              <el-table-column
                inline-template
                label="内容">
                <div>{{row.content||'-'}}</div>
              </el-table-column>
              <el-table-column
                inline-template
                label="是否热门">
                <div>{{row.hot ? '是':'否' || '-'}}</div>
              </el-table-column>
              <el-table-column
                inline-template
                label="是否推荐">
                <div>{{row.recommend ? '是':'否' || '-'}}</div>
              </el-table-column>
              <el-table-column
                inline-template
                label="图片">
                <div><img class="height80" :src="row.img" alt=""></div>
              </el-table-column>
              <el-table-column
                inline-template
                :context="_self"
                label="操作"
                width="100">
                <span>
                   <el-button @click="edittags($index,row)" type="text" size="small">编辑</el-button>
                  <el-button @click="deltags($index,row)" type="text" size="small">删除</el-button>
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
        :total="pageCfg.total">
      </el-pagination>
      <div class="shade" v-if="modal.addShow" >
        <div class="edit-form" style="width:600px">
          <el-form ref="ruleForm" :model="addInfo" :rules="rules" label-width="100px">
            <el-form-item label="content" prop="content">
              <el-input v-model.trim="addInfo.content" placeholder="请填写标签"></el-input>
            </el-form-item>
            <el-form-item label="热门" prop="hot">
              <el-radio-group 
                v-model="addInfo.hot">
                <el-radio label="1">是</el-radio>
                <el-radio label="0">否</el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item label="推荐" prop="recommend">
              <el-radio-group 
                v-model="addInfo.recommend">
                <el-radio label="1">是</el-radio>
                <el-radio label="0">否</el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item label="img">
              <uploader></uploader>
            </el-form-item>
            <el-form-item>
              <el-button v-if="modal.editShow" type="primary" @click="editPost">确定</el-button>
              <el-button v-else type="primary" @click="addPost">确定</el-button>
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
import uploader from '../lib/uploader.vue'

export default {
  data() {
    return {
      dataReady: true,
      tags: [],
      modal: {
        addShow: false,
        dialogShow: false,
        editShow: false
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
      search: '',
      tagsInfo: [],
      checkedTags: [],
      addInfo: {
        content: '',
        recommend: '0',
        hot: '0',
        img: ''
      },
      tagsInfo: {},
      alertShow: false,
      alertMsg: '',
      rules: {
        content: [
          { required: true, message: '请填写标签', trigger: 'blur'}
        ],
        hot: [
          { required: true, message: '请选择是否热门', trigger: 'change' }
        ],
        recommend: [
          { required: true, message: '请选择是否推荐', trigger: 'change' }
        ]
      }
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
        type: this.selected.number
      }

      CGI.post(this.$store.state, 'get_tags', param, (resp) => {
        if (resp.errno === 0) {
          var data = resp.data;
          if (data.infos) {
            this.tags = data.infos;
          }
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
    addtags() {
      CGI.objClear(this.addInfo);
      this.addInfo.recommend = '0';
      this.addInfo.hot = '0';
      this.modal.addShow = true;
    },
    edittags(idx, row) {
      console.log(JSON.stringify(row));
      this.selIdx = idx;
      var u = CGI.clone(row);
      u.recommend = ~~(u.recommend) + ''
      u.hot = ~~(u.hot) + '';
      CGI.extend(this.addInfo, u);
      console.log(JSON.stringify(this.addInfo));
      this.modal.title = '编辑';
      this.modal.editShow = true;
      this.modal.addShow = true;
    },
    editPost() {
      var _this = this;
      this.$refs['ruleForm'].validate((valid)=> {
        if (valid) {
          var param = CGI.clone(this.addInfo);
          param.recommend = ~~param.recommend;
          param.hot = ~~param.hot
          param.id = this.tags[this.selIdx].id;
          if (this.$store.state.imgUrl.length>0 && param.headurl !== this.$store.state.imgUrl){
            param.img = this.$store.state.imgUrl;
          }
          CGI.post(this.$store.state, 'mod_tag', param, function(resp) {
            if (resp.errno == 0) {
              //CGI.extend(_this.tags[_this.selIdx], param);
              _this.getData(true)
              _this.$store.state.imgUrl = '';
              _this.modal.editShow = false;
              _this.modal.addShow = false;
              _this.selIdx = -1;
            } else {
              _this.alertInfo(resp.desc);
            }
          }) 
        }
      })
    },
    addPost() {
      var _this = this;
      this.$refs['ruleForm'].validate((valid) => {
        if (valid) {
          console.log(JSON.stringify(_this.addInfo));
          var param = CGI.clone(_this.addInfo);
          param.img = this.$store.state.imgUrl;
          param.recommend = ~~param.recommend;
          param.hot = ~~param.hot;
          console.log(JSON.stringify(param));
          CGI.post(this.$store.state, 'add_tag', param, function(resp) {
            if (resp.errno == 0) {
              _this.alertInfo('新增成功');
              //_this.tags.unshift(this.addInfo);
              //_this.tags[0].id = resp.data.id;
              _this.getData(true);
              _this.$store.state.imgUrl = '';
              _this.modal.addShow = false;
            } else {
              _this.alertInfo(resp.desc);
            }
          })
        }//else {}
      })
    },
    deltags(idx, row) {
      this.selIdx = idx;
      this.dialogCfg.title = '删除';
      this.dialogCfg.text = '确认要删除' + row.id;
      this.tagsInfo = CGI.clone(row);
      this.modal.dialogShow = true;
    },
    delPost() {
      var ids = [];
      ids.push(this.tagsInfo.id);
      var param = {
        ids: ids
      }
      CGI.post(this.$store.state, 'del_tags', param, (resp)=> {
        if (resp.errno === 0) {
          this.tags.splice(this.selIdx, 1);
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
