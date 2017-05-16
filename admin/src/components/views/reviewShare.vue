<template>
  <div class="mana_container">
    <article class="module width_3_quarter">
      <header class="app_header">
        <div>
          <button type="button" class="btn btn-info btn-left outline-none">
            笑点状态<select v-model="type" @change="getData(true)"><option :value="{ number: 0 }">未评分</option><option :value="{ number: 1 }">已评分</option></select>
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
                label="播放次数">
                <div>{{row.views||'-'}}</div>
              </el-table-column>
              <el-table-column
                inline-template
                label="图片">
                <div class="height80" ><img class="height80" :src="row.img"></div>
              </el-table-column>
              <el-table-column
                inline-template
                label="标题">
                <div>{{row.title||'-'}}</div>
              </el-table-column>
              <el-table-column
                inline-template
                label="标签">
                <div>{{row.tags||'-'}}</div>
              </el-table-column>
              <el-table-column
                inline-template
                label="描述">
                <div>{{row.desc||'-'}}</div>
              </el-table-column>
              <el-table-column
                inline-template
                label="分享者uid">
                <div>{{row.uid||0}}</div>
              </el-table-column>
              <el-table-column
                inline-template
                label="分享者昵称">
                <div>{{row.nickname||'-'}}</div>
              </el-table-column>
              <el-table-column
                inline-template
                label="分享者头像">
                <div><img class="height80" :src="row.headurl"></div>
              </el-table-column>
              <el-table-column
                inline-template
                :context="_self"
                label="操作"
                width="100">
                <span>
                  <el-button @click="review($index,row)" type="text" size="small">评分(笑点)</el-button>
                  <el-button @click="setTag($index,false)" type="text" size="small">设置标签</el-button>
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
      <div class="shade" v-if="modal.reviewShow" >
        <div class="edit-form" style="width:600px">
          <div class="form-title">{{modal.title}}</div>
          <el-form :model="reviewInfo" :rules="rules" ref="ruleForm" label-width="100px">
            <el-form-item label="smile" prop="smile">
              <el-input type="smile" v-model.number="reviewInfo.smile" placeholder="最低smile值为0，最高smile值为5"></el-input>
            </el-form-item>
            <el-form-item 
              label="标题" 
              prop="title">
              <el-input v-model="reviewInfo.title" placeholder="若要修改标题，请填写标题"></el-input>
            </el-form-item>
             <el-form-item>
              <el-button type="primary" @click.native="reviewPost">确定</el-button>
              <el-button @click.native="modal.reviewShow=false">取消</el-button>
            </el-form-item>
          </el-form>
        </div>
      </div>
      <div class="shade" v-if="modal.tagShow">
        <div class="edit-form" style="width:600px">
          <div class="form-title">{{modal.title}}</div>
          <el-form label-width="80px">
            <el-form-item label="标签">
              <el-checkbox-group v-model="checkedTags">
                <el-checkbox v-for="tag in tags" :label="tag.id">{{tag.content}}</el-checkbox>
              </el-checkbox-group>
              <span class="btn btn-info btn-sm" v-show="tagsMore" @click="setTag(-1,true)">点击加载更多</span>
            </el-form-item>
             <el-form-item>
              <el-button type="primary" @click.native="tagPost">确定</el-button>
              <el-button @click.native="modal.tagShow=false">取消</el-button>
            </el-form-item>
          </el-form>
        </div>
      </div>
      <el-dialog v-model="modal.dialogShow"  :title="dialogCfg.title" size="tiny">
        <span>{{dialogCfg.text}}</span>
        <span slot="footer" class="dialog-footer">
          <el-button type="primary" @click.native="rejectPost">确 定</el-button>
          <el-button @click.native="modal.tagShow = false">取 消</el-button>
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
import md5 from 'md5'

var searchParams = {};
var tagNum = 0;
export default {
  data() {
    return {
      dataReady: false,
      tagsReady: false,
      pageCfg: {
        total: 1,
        currentPage: 1,
        start: 0,
        limit: 30,
      },

      infos: [],
      tags: [],
      selIdx: -1,
      alertShow: false,
      alertMsg: '',
      modal: {
        title: '',
        reviewShow: false,
        dialogShow: false,
        tagShow: false
      },
      dialogCfg: {
        title: '',
        text: ''
      },
      type: {
        number:0
      },
      reviewInfo: {
        title: '',
        reject: '0',
        modify: 0,
        smile: 0,
      },
      checkedTags: [],
      tagsMore: false,
      rules: {
        smile: [{ required: true, message: 'smile不能为空'},
              { type: 'number', min:0, max: 5,message: '请输入正确的smile值，最小值0，最大值5'}]
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
      //判断分页是否为第一页
      if (reload) {
        this.pageCfg.start = 0;
      }

      var param = {
        seq: this.pageCfg.start || 0,
        num: 30,
        type: this.type.number
      };
      CGI.post(this.$store.state, 'get_shares', param, (resp) => {
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
    review(idx, row) {
      this.selIdx = idx;
      this.modal.title = '审核';
      this.reviewInfo.title
      this.reviewInfo.title = this.infos[this.selIdx].title || '';
      this.modal.reviewShow = true;
    },
    reviewPost() {
      this.$refs['ruleForm'].validate((valid)=> {
        if (valid) {
          var param = {};
          var param = {
            id: this.infos[this.selIdx].id,
            smile: this.reviewInfo.smile,
            reject: 0
          }

          if (this.reviewInfo.title !== this.infos[this.selIdx].title) {
            param.modify = 1,
            param.title = this.reviewInfo.title
          }
          var _this = this;
          CGI.post(this.$store.state, 'review_share', param, function(resp) {
            if (resp.errno == 0) {
              _this.infos.splice(_this.selIdx,1);
              _this.selIdx = -1;
              _this.modal.reviewShow = false; 
            } else {
              _this.alertInfo(resp.desc);
            }
          })
        }
      })
    },
    rejectPost() {
      var param = {
        reject: 1,
        id: this.infos[this.selIdx].id
      }
      CGI.post(this.$store.state, 'review_share', param, (resp)=> {
        if (resp.errno == 0) {
          this.infos.splice(this.selIdx,1);
          this.selIdx = -1;
          this.modal.dialogShow = false; 
        } else {
          this.alertInfo(resp.desc);
        }
      })
    },
    setTag(idx,more) {
      //console.log(this.tags[this.tags.length-1].seq);
      if (idx >= 0) {
        this.selIdx = idx;
      }
      this.modal.title = '设置标签';
      tagNum++;
      if (this.tags.length <= 0 || more) {
        var param = {
          num: 30,
          seq: (tagNum-1)*30
        }
        CGI.post(this.$store.state, 'get_tags', param, (resp)=> {
          if (resp.errno == 0) {
            if (resp.data.infos && resp.data.infos.length >0) {
              this.tags =  this.tags.concat(resp.data.infos);
            }
            if(param.seq == 0 && this.tags.length >0) {
              this.modal.tagShow = true;
            }
            if (this.tags.length < resp.data.total) {
              this.tagsMore = true;
            } else {
              this.tagsMore = false;
            }
          } else {
            this.modal.tagShow = true;
          }
        })
      } else  {
        this.modal.tagShow = true;
      }
    },
    tagPost() {
      var param = {
        id: this.infos[this.selIdx].id,
        tags: this.checkedTags
      }
      CGI.post(this.$store.state, 'add_share_tags', param, (resp)=> {
        if (resp.errno === 0) {
          var tag = param.tags.join(',');
          this.infos[this.selIdx].tags = this.infos[this.selIdx].tags + tag;
          //this.getData(true);
          this.selIdx = -1;
          this.modal.tagShow = false;
        } else {
          this.alertInfo(resp.desc);
        }
      })
    },
    handleChecked(value) {
      console.log(JSON.stringify(value));
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
