<template>
  <div class="mana_container">
    <article class="module width_3_quarter">
      <header class="app_header">
        <div>
          <button type="button" class="btn btn-info btn-left outline-none">
            笑点状态<select v-model="type" @change="getData(0)"><option :value="{ number: 0 }">未评分</option><option :value="{ number: 1 }">已评分</option></select>
          </button>
        </div>
        <div>
          <div class="quick_search">
            <i class="iconfont icon-search g-fl"></i>
            <input class="ipt-search" v-model="search" type="number" placeholder="请输入id(数字)搜索" @keyup.enter="searchInfo">
          </div>
          <button class="btn btn-default btn-ssm g-fl" @click="getData(pageCfg.start)">刷新</button>
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
                <div>{{makeTag(row.taginfo)||'-'}}</div>
              </el-table-column>
              <el-table-column
                inline-template
                label="描述">
                <div>{{row.desc||'-'}}</div>
              </el-table-column>
              <el-table-column
                inline-template
                label="笑脸值">
                <div>{{row.smile||0}}</div>
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
              <el-button @click.native="modalHide">取消</el-button>
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
      },
      search: Number
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
    this.getData(0);
  },
  methods: {
    getData(reload) {
      //判断分页是否为第一页
      var param = {
        seq: reload,
        num: 30,
        type: this.type.number
      };
      CGI.post(this.$store.state, 'get_shares', param, (resp) => {
        if (resp.errno === 0) {
          var data = resp.data;
          this.infos = data.infos || [];
          if (data.infos && data.infos.length >0) {
            var _this = this;
            this.infos.forEach(function(item) {
              if (!item.smile) {
                item.smile = 0;
              }
              if (!item.title) {
                item.title = '';
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
    review(idx, row) {
      this.selIdx = idx;
      this.modal.title = '审核';
      this.reviewInfo.smile = this.infos[this.selIdx].smile;
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
              if (_this.type.number) {
                _this.infos[_this.selIdx].smile = param.smile;
                if (param.modify) {
                  _this.infos[_this.selIdx].title = param.title;
                }
              } else {
                _this.infos.splice(_this.selIdx,1);
              }
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
      if (idx >= 0) {
        this.selIdx = idx;
      }
      this.modal.title = '设置标签';
      this.checkedTags = [];
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
              this.addTag(); 
            }
            if(param.seq == 0 && this.tags.length >0) {
              this.modal.tagShow = true;
            }
            console.log(this.tags.length);
            if (this.tags.length < resp.data.total) {
              this.tagsMore = true;
            } else {
              this.tagsMore = false;
            }
          } else {
            this.alertInfo(resp.desc);
          }
        })
      } else  {
        this.addTag(); 
        this.modal.tagShow = true;
      }
    },
    addTag() {
      var idx = this.selIdx;
      if (this.infos[idx].taginfo && this.infos[idx].taginfo.length>0) {
        if (this.tags && this.tags.length >0) {
          var len = this.infos[idx].taginfo.length;
          var tagLen = this.tags.length;
          for(var i =0; i<len; i++) {
            for (var j=0; j<tagLen; j++) {
              if (this.tags[j].id == this.infos[idx].taginfo[i].id) {
                this.checkedTags.push(this.tags[j].id);
                break;
              }
            }
          }
        } 
      }      
    },
    tagPost() {
      var param = {
        id: this.infos[this.selIdx].id,
        tags: this.checkedTags
      }
      CGI.post(this.$store.state, 'add_share_tags', param, (resp)=> {
        if (resp.errno === 0) {
          this.getData(this.pageCfg.start);
          tagNum = 0;
          this.selIdx = -1;
          this.modal.tagShow = false;
        } else {
          this.alertInfo(resp.desc);
        }
      })
    },
    modalHide() {
      tagNum = 0;
      this.selIdx = -1;
      this.modal.tagShow = false;
    },
    searchInfo() {
      if (this.search >0) {
        var param = {
          id: ~~this.search
        }
        CGI.post(this.$store.state, 'search_share',param, (resp)=> {
          if (resp.errno === 0) {
            this.infos = resp.data.infos;
          } else {
            this.alertInfo(resp.desc);
          }
        })
      } else {
        this.alertInfo('请先输入id,再搜索')
      }
    },
    makeTag(val) {
      var ret = [];
      if (val && val.length>0) {
        val.forEach((item)=>{
          ret.push(item.content);
        })
      }
      return ret.join(',');
    },
    handleChecked(value) {
      console.log(JSON.stringify(value));
    },
    handleSizeChange(val) {
      console.log(`每页 ${val} 条`);
    },
    handleCurrentChange(val) {
      this.pageCfg.start = (val-1)*30;
      this.getData(this.pageCfg.start);
      console.log(`当前页: ${val}`);
    },
    alertInfo(val) {
      this.alertShow = true;
      this.alertMsg = val;
    },
    refresh() {
      this.getData(this.pageCfg.start);
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
.quick_search {
  margin-top: 7px;
}
</style>
