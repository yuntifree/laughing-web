<style lang="scss">
@import '../../assets/css/table.css';
@import '../../assets/css/common.scss';
.dropdown-menu>li>a button[disabled] {
  color: #ccc;
}
.el-button,
.el-button+.el-button {
    margin-left: 10px;
}

</style>
<template>
  <div class="mana_container">
    <article class="module width_3_quarter">
      <header class="app_header">
        <div>
          <button type="button" class="btn btn-info btn-left outline-none">
            视频状态<select v-model="selected" @change="getData(true)"><option :value="{ number: 0 }">未审核</option><option :value="{ number: 1 }">上 线</option><option :value="{ number: 2 }">下 线</option></select></button>
          </button>
        </div>
        <div>
          <div class="quick_search">
            <i class="iconfont icon-search"></i>
            <input class="ipt-search" type="text" placeholder="ID/电话/用户名"
              v-model.trim="search" @keyup.enter="doSearch(true)">
          </div>
          <button class="btn btn-default btn-ssm" @click="getData(true)">刷新</button>
        </div>
      </header>
      <!--table-->
      <div class="tab_container" ref="tableContent">
        <div id="tab1" class="tab_content tab-fixed" v-if="dataReady">
          <template>
            <el-table
              :data="videos"
              :height="tableHeight"
              border
              highlight-current-row>
              <el-table-column
                inline-template
                label="文章ID">
                <div>{{row.id||'-'}}</div>
              </el-table-column>
              <el-table-column
                inline-template 
                label="图片">
                  <img style="width:100%;height:auto;" :src="row.img"/>
              </el-table-column>
              <el-table-column
                inline-template
                label="标题">
                <div>{{row.title||'-'}}</div>
              </el-table-column>
              <el-table-column
                inline-template
                label="来源">
                <div>{{row.source||'-'}}</div>
              </el-table-column>
              <el-table-column
                inline-template
                label="时长">
                <div>{{row.duration||'-'}}</div>
              </el-table-column>
              <el-table-column
                inline-template
                label="时间">
                <div>{{row.ctime}}</div>
              </el-table-column>
              <el-table-column
                inline-template
                :context="_self"
                label="操作"
                width="100">
                <span>
                  <el-button @click="editvideos($index,row)" type="text" size="small">审核</el-button>
                  <el-button @click="review($index,row,0)" type="text" size="small">上线</el-button>
                  <el-button @click="review($index,row,1)" type="text" size="small">下线</el-button>
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
         :total="pageCfg.total ||1">
       </el-pagination>
       <!--edit-->
       <div class="shade" v-if="modal.editShow" >
        <div class="edit-form" style="width:600px">
          <el-form ref="form" :model="videosInfo" label-width="80px">
            <el-form-item label="审核操作">
              <el-radio-group v-model="videosInfo.reject">
                <el-radio label="0">通过</el-radio>
                <el-radio label="1">拒绝</el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item label="title">
              <el-input v-model="videosInfo.title"></el-input>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="editPost(event,false)">确定</el-button>
              <el-button @click="modal.editShow=false">取消</el-button>
            </el-form-item>
          </el-form>
        </div>
      </div>
      <!--dialog-->
      <el-dialog v-model="modal.dialogShow"  :title="dialogCfg.title" size="tiny">
        <span>{{dialogCfg.text}}</span>
        <span slot="footer" class="dialog-footer">
          <el-button @click.native="modal.dialogShow=false">取 消</el-button>
          <el-button type="primary" @click.native="editPost(event,true)">确 定</el-button>
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
      videos: [],
      pageCfg: {
        total: 1,
        limit: 30,
        start: 0,
        currentPage: 1,
      },
      selIdx: -1,

      modal: {
        editShow: false,
        dialogShow: false
      },
      dialogCfg: {
        title: '',
        text: '',
      },
      selected: {
        number:0
      },
      alertShow: false,
      alertMsg: '',
      search: '',
      videosInfo: {
        title: '',
        reject: 0,
        modify: 0,
      },
      editInfo: {},
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
      this.dataPost(param);
    },
    dataPost(param) {
      CGI.post(this.$store.state, 'get_videos', param, (resp) => {
        if (resp.errno === 0) {
          var data = resp.data;
          this.videos = data.infos;
          if (this.videos && this.videos.length>0) {
            this.videos.forEach( (item,index)=> {
              item.idx = index;
            })
          }
          this.pageCfg.total = data.total;
          this.dataReady = true;
        } else {
          this.alertInfo(resp.desc);
        }
      });
    },
    reviewStastus(val) {
      var ret;
      switch(val) {
        case 0:
          ret = '未审核';
          break;
        case 1:
          ret = '通过';
          break;
        case 2:
          ret = '拒绝';
          break;
      }
      return ret;
    },
    editvideos(idx,row) { 
      this.selIdx = idx;
      CGI.objClear(this.videosInfo);
      this.videosInfo.reject = '1';
      this.videosInfo.title = row.title;
      this.editInfo = CGI.clone(row);
      this.modal.editShow = true;
    },
    editPost(event,confirm) {
      if (this.editInfo.title.length <= 0) {
        this.alertInfo('请输入title');
        return;
      }
      var param = {};
      if (confirm) {
        param.id = this.editInfo.id;
        param.reject = ~~this.videosInfo.reject;
      } else {
        if (this.videosInfo.title !== this.editInfo.title) {
          param.title = this.videosInfo.title;
          param.modify = 1;
        }
        param.reject = ~~this.videosInfo.reject;
        param.id = this.editInfo.id;
      }
      
      CGI.post(this.$store.state,'review_video',param,(resp)=> {
        if (resp.errno === 0) {
          //index没改
          this.videos.splice(this.selIdx,1);
          this.modal.editShow = false;
          this.modal.dialogShow = false;
          this.selIdx = -1;
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
        title = '拒绝';
        text = '确认要拒绝' + row.id + '的审核吗？'; 
      } else {
        title = '通过';
        text = '确认要通过' + row.id + '的审核吗？';
      }
      this.dialogCfg.title = title;
      this.dialogCfg.text = text;
      this.videosInfo.reject = ~~ops;
      this.editInfo = CGI.clone(row);
      this.modal.dialogShow = true;
    },
    handleSizeChange(val) {
      console.log(`每页 ${val} 条`);
    },
    handleCurrentChange(val) {
      this.pageCfg.start = (val-1)*30;
      if (this.search.length > 0) {
        this.doSearch(false);
      } else {
        this.getData(false);
      }
      console.log(`当前页: ${val}`);
    },
    alertInfo(val) {
      this.alertShow = true;
      this.alertMsg = val;
    },
    doSearch(first) {
      if (this.search.length <= 0) {
        this.alertInfo('请输入搜索信息');
        return;
      }
      if (first) {
        this.pageCfg.currentPage = 1;
        this.pageCfg.start = 0;
      }
      var param = {
        seq: this.pageCfg.start,
        num: 30,
        type: this.selected.number,
        search: this.search
      }
      this.dataPost(param);
    }
  }
}
</script>
