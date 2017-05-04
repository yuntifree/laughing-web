<template>
  <div class="mana_container">
    <article class="module width_3_quarter">
      <header class="app_header">
        <div>
          <button class="btn btn-default btn-sm outline-none" @click="addTime">
          <i class="iconfont icon-add"></i>添加
          </button>
        </div>
        <div>
          <div class="quick_search">
            <i class="iconfont icon-search"></i>
            <input class="ipt-search" type="text" placeholder="ID/电话/用户名">
          </div>
          <button class="btn btn-default btn-ssm" @click="getData(0)">刷新</button>
        </div>
      </header>
      <!--end:右键菜单-->
      <div class="tab_container" ref="tableContent">
        <div class="tab_content tab-fixed" v-if="dataReady">
          <template>
            <el-table
              :data="infos"
              :height="tableHeight"
              border>
              <el-table-column
                inline-template
                label="id">
                <div>{{row.id||'-'}}</div>
              </el-table-column>
              <el-table-column
                inline-template
                label="content">
                <div>{{row.content||'-'}}</div>
              </el-table-column>
              <el-table-column
                inline-template
                :context="_self"
                label="操作"
                width="100">
                <span>
                  <el-button @click="editTime($index,row)" type="text" size="small">编辑</el-button>
                  <el-button @click="delTime($index,row)" type="text" size="small">删除</el-button>
                </span>
              </el-table-column>
            </el-table>
          </template>
        </div>
      </div>
      <!--翻页-->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="pageCfg.currentPage"
        :page-size="pageCfg.limit"
        layout="prev, pager, next, jumper"
        :total="pageCfg.total">
      </el-pagination>
      <div class="shade" v-if="modal.editShow" >
        <div class="edit-form">
          <div class="form-title">{{modal.text}}</div>
          <el-form ref="form" label-width="100px">
            <el-form-item label="起始时间">
              <el-time-select
                 placeholder="起始时间"
                 v-model.trim="startTime"
                 :picker-options="{
                   start: '00:00',
                   step: '01:00',
                   end: '23:00'
                 }">
               </el-time-select>        
            </el-form-item>
            <el-form-item label="结束时间">
              <el-time-select
                  placeholder="结束时间"
                  v-model.trim="endTime"
                  :picker-options="{
                    start: '00:00',
                    step: '01:00',
                    end: '23:00',
                    minTime: startTime
                  }">
                </el-time-select>     
            </el-form-item>
            <!--el-form-item label="活动时间" required>
              <el-form-item prop="date1">
                <el-date-picker type="date" placeholder="选择日期" v-model="ruleForm.date1" style="width: 100%;"></el-date-picker>
              </el-form-item>
            </el-form-item-->
            <el-form-item>
              <el-button type="primary" v-if="modal.addShow" @click="addPost">确定</el-button>
              <el-button type="primary" v-else @click="editPost">确定</el-button>
              <el-button @click="modal.editShow=false">取消</el-button>
            </el-form-item>
          </el-form>
        </div>
      </div>
      <el-dialog v-model="modal.dialogShow"  :title="dialogCfg.title" size="tiny">
        <span>{{dialogCfg.text}}</span>
        <span slot="footer" class="dialog-footer">
          <el-button @click.native="modal.dialogShow = false">取 消</el-button>
          <el-button type="primary" @click.native="delPost">确 定</el-button>
        </span>
      </el-dialog>
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
      dataReady: false,
      pageCfg: {
        total: 1,
        currentPage: 1,
        start: 0,
        limit: 30,
      },

      // table data
      infos: [],

      modal: {
        editShow: false,
        dialogShow: false,
      },
      dialogCfg: {
        title: '',
        text: '',
      },
      selIdx: -1,
      alertShow: false,
      alertMsg: '',
      postInfo: {
        content: '',
      },
      startTime: '',
      endTime: '',
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
      //判断分页是否为第一页
      if (reload) {
        this.pageCfg.start = 0;
      }
      var param = {
        seq: this.pageCfg.start || 0,
        num: 30,
      };
      CGI.post(this.$store.state, 'get_timeslot', param, (resp) => {
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
    editTime(idx, row) {
      //CGI.extend(this.postInfo, row);
      this.selIdx = idx;
      var content = row.content;  
      var subIdx = content.indexOf('~');
      var len = content.length;
      this.startTime = content.substring(0,subIdx);
      this.endTime = content.substring(subIdx+1,len);
      this.modal.text = '修改';
      this.modal.addShow = false;
      this.modal.editShow = true;
    },
    addTime() {
      this.startTime = '';
      this.endTime = '';
      this.modal.text = '增加';
      this.modal.addShow = true;
      this.modal.editShow = true;
    },
    makeTime() {
      var ret = true;
      if (this.startTime.length <= 0) {
        this.alertInfo('请选择开始时间');
        ret = false;
      }
      if (this.endTime.length <= 0) {
        this.alertInfo('请选择结束时间');
        ret = false;
      }
      return ret;
    },
    addPost() {
      if (this.makeTime()) {
        var content = this.startTime + '~' + this.endTime;
        CGI.post(this.$store.state, 'add_timeslot', {content: content}, (resp)=> {
          if (resp.errno === 0) {
            var u = {
              content: content,
              id: resp.data.id
            }
            this.infos.unshift(u);
            this.modal.editShow = false;
          } else {
            this.alertInfo(resp.desc);
          }
        })
      }
    },
    editPost() {
      if (this.makeTime()) {
        var content = this.startTime + '~' + this.endTime;
        var param = {
          id: this.infos[this.selIdx].id,
          content: content,
          deleted: 0
        }
        CGI.post(this.$store.state, 'mod_timeslot', param, (resp)=> {
          if (resp.errno === 0) {
            this.infos[this.selIdx].content = content;
            this.selIdx = -1;
            this.editShow = false;
          } else {
            this.alertInfo(resp.desc);
          }
        })
      }
    },
    delAds(idx, row) {
      this.selIdx = idx;
      this.dialogCfg.title = '删除';
      this.dialogCfg.text = '确认要删除' + row.uid +'吗';
      this.modal.dialogShow = true;
    },
    delTime() {
      var param = this.infos[this.selIdx];
      param.deleted = 1;
      CGI.post(this.$store.state, 'mod_timeslot', param, (resp)=> {
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
    handleSizeChange(val) {
      console.log(`每页 ${val} 条`);
    },
    handleCurrentChange(val) {
      this.pageCfg.start = (val-1)*30;
      this.getData(false);
      console.log(`当前页: ${val}`);
    },
    alertInfo(val) {
      this.alertShow = true;
      this.alertMsg = val;
    },
    refresh() {
      this.getData(false);
    }
  },
}
</script>
<style lang="scss">
@import '../../assets/css/table.css', '../../assets/css/common.scss';
.user-table td:last-child {
  white-space: pre-wrap;
  word-wrap: break-word;
  max-width: 300px;
}
.modal-detail>div {
  padding: 10px 0;
}
.det_img {
  @include pos(top,26px, right, 37px);
}
</style>
