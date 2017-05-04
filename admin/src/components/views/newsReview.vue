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
          <button type="button" class="btn btn-info btn-left outline-none">
            文章状态<select v-model="type" @change="getData(true)"><option :value="{ number: 0 }">未审核</option><option :value="{ number: 1 }">上 线</option><option :value="{ number: 2 }">下 线</option></select>
          </button>
          <button type="button" class="btn btn-info btn-left outline-none">
            地区<select v-model="stype" @change="getData(true)"><option :value="{ number: 0 }">全部</option><option :value="{ number: 1 }">东莞</option></select>
          </button>
        </div>
        <div>
          <div class="quick_search">
            <i class="iconfont icon-search"></i>
            <input class="ipt-search" type="text" placeholder="标题/title"
              v-model.trim="search" @keyup.enter="doSearch(true)">
          </div>
          <button class="btn btn-default btn-ssm" @click="getData(true)">刷新</button>
        </div>
      </header>
      <div class="tab_container" ref="tableContent">
        <div id="tab1" class="tab_content tab-fixed" v-if="dataReady">
          <template>
            <el-table
              :data="news"
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
                label="标题">
                <div>{{row.title||'-'}}</div>
              </el-table-column>
              <el-table-column
                inline-template
                label="模板名称">
                <div>{{row.modalName||'-'}}</div>
              </el-table-column>
              <el-table-column
                inline-template
                label="来源">
                <div>{{row.source||'-'}}</div>
              </el-table-column>
              <el-table-column
                inline-template
                label="时间">
                <div>{{row.ctime||'-'}}</div>
              </el-table-column>
              <el-table-column
                inline-template
                label="操作人员">
                <div>{{row.operator||'-'}}</div>
              </el-table-column>
              <el-table-column
                inline-template
                label="阅读数">
                <div>{{row.reading||'-'}}</div>
              </el-table-column>
              <el-table-column
                inline-template
                :context="_self"
                label="操作"
                width="100">
                <span>
                  <el-button @click="edit($index,row)" type="text" size="small">审核</el-button>
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
        :total="pageCfg.total || 1">
      </el-pagination>
      <div class="shade" v-if="modal.editShow" >
        <div class="edit-form" style="width:600px">
          <el-form ref="form" :model="newsInfo" label-width="80px">
            <el-form-item label="审核操作">
              <el-radio-group v-model="newsInfo.reject">
                <el-radio label="0">通过</el-radio>
                <el-radio label="1">拒绝</el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item label="title">
              <el-input v-model="newsInfo.title"></el-input>
            </el-form-item>
            <el-form-item label="标签">
              <el-checkbox-group v-model="checkedTags" @change="handleChecked">
                <el-checkbox v-for="tag in tagsInfo" :label="tag.id">{{tag.content}}</el-checkbox>
              </el-checkbox-group>
              <span class="btn btn-info btn-sm" v-show="tagsInfo.hasmore" @click="edit('','',tagsInfo[tagsInfo.length-1].seq)">点击加载更多</span>
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
          <el-button type="primary" @click.native="chkonline">确 定</el-button>
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
      news: [],
      modal: {
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

      type: {
        number:0
      },
      stype: {
        number: 0
      },
      search: '',
      tagsInfo: [],
      checkedTags: [],
      tagsMore: false,
      newsInfo: {
        title: '',
        reject: '0',
        modify: 0,
        tags: [],
      },
      editInfo: {},
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
        type: this.type.number,
        stype: this.stype.number
      }
      this.search = '';
      this.dataPost(param);
    },
    dataPost(param) {
      CGI.post(this.$store.state, 'get_news', param, (resp) => {
        if (resp.errno === 0) {
          var data = resp.data;
          this.news = data.infos;
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
      this.pageCfg.currentPage = val;
      if (this.search.length > 0) {
        this.doSearch(false);
      } else {
        this.getData(false);
      }
      console.log(`当前页: ${val}`);
    },
    handleChecked(value) {
      console.log(JSON.stringify(value));
    },
    edit(idx,row,seq) {
      this.selIdx = idx;
      var param = {
        seq: seq || 0,
        num:5
      }
      CGI.post(this.$store.state,'get_tags',param,(resp)=>{
        if (resp.errno === 0) {
          if (param.seq === 0) {
            this.tagsInfo = resp.data.infos;
            if (this.tagsInfo.length < resp.data.total) {
              this.tagsMore = true;
            }//else {};
          } else {
            this.tagsInfo = this.tagsInfo.concat(resp.data.infos);
            if (this.tagsInfo.length < resp.data.total) {
              this.tagsMore = true;
            }
          }
          CGI.objClear(this.newsInfo);
          this.newsInfo.reject = '1';
          this.newsInfo.title = row.title;
          this.editInfo =  CGI.clone(row);
          this.modal.editShow = true;
        } else {
          this.alertInfo(resp.desc);
        }
      })
    },
    editPost() { 
      if (this.editInfo.title.length <= 0) {
        this.alertInfo('请输入title');
        return;
      }
      var param = {};
      var paramTags = [];
      if (this.newsInfo.title !== this.editInfo.title) {
        param.title = this.newsInfo.title;
        param.modify = 1;
      }
      if (this.checkedTags.length > 0) {
        param.tags = this.checkedTags;
      }
      param.reject = ~~this.newsInfo.reject;
      param.id = this.editInfo.id;
      this.actPost(param);
    },
    actPost(param) {
      CGI.post(this.$store.state,'review_news',param,(resp)=> {
        if (resp.errno === 0) {
          this.news.splice(this.selIdx,1);
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
        title = '拒绝通过';
        text = '确认要拒绝' + row.id + '的审核吗？'; 
      } else {
        title = '审核通过';
        text = '确认要通过' + row.id + '的审核吗？';
      }
      this.dialogCfg.title = title;
      this.dialogCfg.text = text;
      this.newsInfo.reject = ops;
      this.editInfo =  CGI.clone(row);
      this.modal.dialogShow = true;
    },
    chkonline() {
      var param = {
        id: this.editInfo.id,
        reject: ~~this.newsInfo.reject
      }
      this.actPost(param);
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
        type: this.type.number,
        stype: this.stype.number,
        search: this.search
      }
      this.dataPost(param);
    }
  }
}
</script>
