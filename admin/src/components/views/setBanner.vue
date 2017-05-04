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
            类型<select v-model="selected" @change="getData(true)"><option :value="{ number: 0 }">banner</option><option :value="{ number: 1 }">广告</option><option :value="{ number: 2 }">活动</option></select></button>
          <button class="btn btn-left outline-none" @click="add">添加</button>
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
              highlight-current-row>
              <el-table-column
                inline-template
                label="id">
                <div>{{row.id||'-'}}</div>
              </el-table-column>
              <el-table-column
                inline-template
                label="title">
                <div>{{row.title ||'-'}}</div>
              </el-table-column>
              <el-table-column
                inline-template
                label="图片">
                <div>
                  <img v-if="row.img" style="width:100%;height:auto;" :src="row.img">
                  <span v-else>-</span>
                </div>
              </el-table-column>
              <el-table-column
                inline-template
                label="跳转地址">
                <div>{{row.dst||'-'}}</div>
              </el-table-column>
              <el-table-column
                inline-template
                label="优先级">
                <div>{{row.priority||0}}</div>
              </el-table-column>
              <el-table-column
                inline-template
                label="状态">
                <div>{{row.online?'上线':'下线'}}</div>
              </el-table-column>
              <el-table-column
                inline-template
                label="是否测试">
                <div>{{row.dbg?'是':'否'}}</div>
              </el-table-column>
              <el-table-column
                inline-template
                label="过期时间">
                <div>{{row.expire | dateFormat('yyyy-MM-dd hh:mm:ss')}}</div>
              </el-table-column>
              <el-table-column
                inline-template
                :context="_self"
                label="操作"
                width="100">
                <span>
                  <el-button @click="edit($index,row)" type="text" size="small">编辑</el-button>
                  <el-button @click="delPost($index,row)" type="text" size="small">删除</el-button>
                  <el-button @click="review($index,row,1)" v-show="!row.online" type="text" size="small">上线</el-button>
                  <el-button @click="review($index,row,0)" v-show="row.online" type="text" size="small">下线</el-button>
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
            <el-form-item v-if="selected.number!==0" label="title">
              <el-input v-model.trim="postInfo.title"></el-input>
            </el-form-item>
            <el-form-item v-if="selected.number!==2" label="img">
              <el-input v-model.trim="postInfo.img"></el-input>
            </el-form-item>
            <el-form-item label="跳转地址">
              <el-input v-model.trim="postInfo.dst"></el-input>
            </el-form-item>
            <el-form-item label="优先级" v-show="!modal.addShow">
              <el-input type="number" v-model.number="postInfo.priority"></el-input>
            </el-form-item>
            <el-form-item label="测试">
              <el-radio-group v-model="postInfo.dbg">
                <el-radio label="1">是</el-radio>
                <el-radio label="0">否</el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item label="上线">
              <el-radio-group v-model="postInfo.online">
                <el-radio label="1">上线</el-radio>
                <el-radio label="0">下线</el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item v-if="!modal.addShow" label="过期时间">
                <el-input disabled v-model="postInfo.expire"></el-input>
              </el-form-item>
            <el-form-item label="设置过期时间">
              <el-col :span="11">
                <el-date-picker type="date" placeholder="选择日期" v-model="dateInfo.date1" style="width: 100%;"></el-date-picker>
              </el-col>
              <el-col class="line" :span="2">-</el-col>
              <el-col :span="11">
                <el-time-picker type="fixed-time" placeholder="选择时间" v-model="dateInfo.date2" style="width: 100%;"></el-time-picker>
              </el-col>
              <!--el-date-picker
                v-model="value1"
                type="datetime"
                placeholder="选择日期时间">
              </el-date-picker-->
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="editPost">确定</el-button>
              <el-button @click="modal.editShow=false">取消</el-button>
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
        delShow: false,
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
      tagsInfo: [],
      checkedTags: [],
      postInfo: {
        title: '',
        img: '',
        dst: '',
        online: '0',
        priority: 0, 
        expire: '',
        dbg: '0',
      },
      dateInfo: {
        date1: '',
        date2: ''
      },
      reviewInfo: {},
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

      CGI.post(this.$store.state, 'get_banners', param, (resp) => {
        if (resp.errno === 0) {
          var data = resp.data;
          this.infos = data.infos;
          if (!this.infos) {
            this.infos = [];
          } else if (this.infos && this.infos.length > 0){
            this.infos.forEach(function(item) {
              if(!item.online) {
                item.online = 0;
              }
              if(!item.dbg) {
                item.dbg = 0;
              }
            })
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
    add() {
      CGI.objClear(this.postInfo);
      this.modal.addShow = true;
      this.modal.editShow = true;
    },
    edit(idx,row) {
      this.selIdx = idx;
      CGI.extend(this.postInfo,row);
      this.dateInfo.date1 = '';
      this.dateInfo.date2 = '';
      this.modal.addShow = false;
      this.modal.editShow = true;
    },
    editPost() { 
      if (!this.postParam()) {
        return;
      }
      var action = '';
      var param = {};
      var addBanner = this.modal.addShow;
      if (addBanner) {
        param = this.postInfo;
        param.expire = this.makeDate();
        param.type = this.selected.number;
        action = 'add_banner';
      } else {
        var postInfo = CGI.clone(this.postInfo);
        postInfo.online = ~~postInfo.online;
        postInfo.dbg = ~~postInfo.dbg;
        param = CGI.objModified(this.infos[this.selIdx], postInfo);
        console.log(JSON.stringify(this.infos[this.selIdx]));
        if(!param['online']) {
          param.online = ~~this.infos[this.selIdx].online || 0;
        } 
        if(!param['dbg']) {
          param.online = ~~this.infos[this.selIdx].dbg || 0;
        }
        if (CGI.emptyObj(param)) {
          this.modal.editShow = false;
          this.selIdx = -1;
          return;
        }
        if (!this.infos[this.selIdx].priority) {
          if (this.postInfo.priority !==0) {
            param.priority = ~~this.postInfo.priority;
          }
        }
        var date = CGI.dateFormat(this.dateInfo.date1,'yyyy-MM-dd');
        var time = CGI.dateFormat(this.dateInfo.date2,'hh:mm:ss');
        if (date !== 'Invalid date') {
          if (time !== 'Invalid date') {
            param.expire = date +' '+ time;
          } else {
            this.alertInfo('请输入过期时间');
            return;
          }
        }       
        param.id = this.infos[this.selIdx].id;
        action = 'mod_banner';
      } 
      param.dbg = ~~param.dbg;
      param.online = ~~param.online;
      CGI.post(this.$store.state, action, param, (resp)=> {
        if (resp.errno === 0) {
          if (addBanner) {
            var u = CGI.clone(this.postInfo);
            u.id = resp.data.id;
            this.infos.push(u);
          } else {
            CGI.extend(this.infos[this.selIdx], this.postInfo);
            if (param.priority) {
              this.infos[this.selIdx].priority = param.priority;
            }
            if (param.expire) {
              this.infos[this.selIdx].expire = param.expire;
            }
          }
          this.modal.editShow = false;
          this.selIdx = -1;
        } else {
          this.alertInfo(resp.desc);
        }
      })
    },
    makeDate() {
      var date = CGI.dateFormat(this.dateInfo.date1, 'yyyy-MM-dd');
      var time = CGI.dateFormat(this.dateInfo.date2, 'hh:mm:ss');
      return date +' '+ time;
    },
    postParam() {
      var ret = true;
      if (this.selected.number !== 0 && this.postInfo.title.length <= 0) {
        this.alertInfo('请输入title');
        ret = false;
      }
      if (this.selected.number !== 2 && this.postInfo.img.length <= 0) {
        this.alertInfo('请输入图片地址');
        ret = false;
      }
      /*if (this.postInfo.dst.length <= 0) {
        this.alertInfo('请输入跳转地址');
        ret = false;
      }*/ 
      if (this.modal.addShow) {
        if (this.dateInfo.date1.length <= 0) {
          this.alertInfo('请选择过期日期');
          ret = false;
        }
        if (this.dateInfo.date2.length <= 0) {
          this.alertInfo('请选择过期时间');
          ret = false;
        }
      }
      return ret;
    },
    review(idx,row,ops) {
      this.selIdx = idx;
      var title = '';
      var text = '';
      if (ops) {
        title = '上线';
        text = '确认要上线吗'; 
      } else {
        title = '下线';
        text = '确认要下线吗';
      }
      this.dialogCfg.title = title;
      this.dialogCfg.text = text;
      this.reviewInfo = row;
      this.reviewOps = ops;
      this.modal.delShow = false;
      this.modal.dialogShow = true;
    },
    onlineOps() {
      var param = {
        id: this.reviewInfo.id
      };
      if (this.modal.delShow) {
        param.delete = 1;
      } else {
        param.online = this.reviewOps;
      }
      CGI.post(this.$store.state, 'mod_banner', param, (resp)=> {
       if (resp.errno === 0) {
        if (this.modal.delShow) {
          this.infos.splice(this.selIdx,1);
        } else {
        this.infos[this.selIdx].online = param.online;           
        }
        this.modal.dialogShow = false;
        this.selIdx = -1;
       } else {
         this.alertInfo(resp.desc);
       }
     })
    },
    delPost(idx,row) {
      this.selIdx = idx;
      this.dialogCfg.title = '删除';
      this.dialogCfg.text = '确认要删除吗？';
      this.reviewInfo = row;
      this.modal.delShow = true;
      this.modal.dialogShow = true;
    },
    alertInfo(val) {
      this.alertShow = true;
      this.alertMsg = val; 
    }
  }
}
</script>
