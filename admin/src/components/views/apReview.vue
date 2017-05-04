<template>
  <div class="mana_container">
    <article class="module width_3_quarter">
      <header class="app_header">
        <div>
          <button class="btn btn-default btn-sm outline-none" @click="clickMap">
          <i class="iconfont icon-add"></i>百度地图
          </button>
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
        <div class="tab_content tab-fixed" v-if="dataReady">
        <template>
            <el-table
              :data="infos"
              :height="tableHeight"
              border
              highlight-current-row>
              <el-table-column
                inline-template
                label="id">
                <div>{{row.id || '-'}}</div>
              </el-table-column>
              <el-table-column
                inline-template
                label="mac">
                <div>{{row.mac || '-'}}</div>
              </el-table-column>
              <el-table-column
                inline-template
                label="位置">
                <div>{{row.address || '-'}}</div>
              </el-table-column>
              <el-table-column
                inline-template
                label="状态">
                <div>{{row.online ? '在线' : '下线' || '-'}}</div>
              </el-table-column>
              <el-table-column
                inline-template
                label="在线人数">
                <div>{{row.count || '0'}}</div>
              </el-table-column>
              <el-table-column
                inline-template
                label="带宽">
                <div>{{row.bandwidth || '-'}}</div>
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
    </article>
    <!--map-->    
    <div v-show="mapShow" id="map" class="map"  style="width:100%;height:100%;position:absolute;top:0;left:0"></div>
    <span v-show="mapShow" class="close-map" @click="mapShow=false">X</span>
  </div>
</template>
<script>
import CGI from '../../lib/cgi.js'

var columns = ['id','ssid','位置','状态','在线人数','带宽'];
var searchParams = {};
export default {
  data() {
    return {
      modal: {
        editShow: false,
      },
      pageCfg: {
        total: 1,
        currentPage: 1,
        start: 0,
        limit: 30,
      },

      // table data
      infos: [],
      columns: columns,
      apAddress: [],
      dataReady: false,
      selIdx: -1,
      showTop: false,
      mapShow: false,
      tips: {
        showTip: false,
        msgTip: '',
      },

      search: '',
    }
  },
  computed: {
    tableHeight() {
      return this.$store.state.tableHeight;
    }
  },
  mounted() {
    if (!this.tableHeight) {
      this.$nextTick(()=> {
        this.$store.state.tableHeight = this.$refs.tableContent.offsetHeight;
      });
    }
    this.getData(true);
    this.$nextTick(()=> {
      CGI.loadScript('http://api.map.baidu.com/getscript?v=2.0&ak=BiR1G4yZybhnXDTDHLYq8WXMPaK7owWm','map.js',()=>{})
    })
  },
  methods: {
    getData(reload) {
      if (this.acvandeQuery) {
        this.acvandeQuery = false;
      }
      //判断分页是否为第一页
      if (reload) {
        this.pageCfg.start = 0;
      }

      var param = {
        seq: this.pageCfg.start,
        num: 30,
      };
      CGI.post(this.$store.state, 'get_ap_stat', param, (resp) => {
        if (resp.errno === 0) {
          var data = resp.data;
          this.infos = data.infos;
          this.pageCfg.total = data.total;
          this.dataReady = true;
        } else {
          this.tip(resp.desc);
        }
      });
    },
    clickMap() { 
     var _this = this;
      var map = new BMap.Map('map');  
      var point = new BMap.Point(113.90387023396529, 22.93310386339828);
      //标注
      map.centerAndZoom(point,15);    
      var marker = new BMap.Marker(point);        // 创建标注    
      map.addOverlay(marker);
      //控件
      map.addControl(new BMap.NavigationControl());
      map.addControl(new BMap.OverviewMapControl());
      getApAddress(point.lng,point.lat);

      //事件
      this.mapShow = true;
      map.addEventListener("dragend", function(){
        var bs = map.getBounds();   //获取可视区域
        var bssw = bs.getSouthWest();   //可视区域左上角
        var bsne = bs.getNorthEast();   //可视区域右上角
        var lng = (bssw.lng+bsne.lng)/2;
        var lat = (bssw.lat+bsne.lat)/2;
        getApAddress(lng,lat);
      });
     function  getApAddress(lng,lat){
        var param = {
          longitude: lng,
          latitude: lat,
        }
        CGI.post(_this.$store.state,'get_nearby_aps',param,(resp)=>{
          if (resp.errno===0) {
            _this.apAddress = resp.data.infos;
            var len = _this.apAddress.length;
            for (var i = 0; i < len; i ++) {
                var spot = new BMap.Point(_this.apAddress[i].longitude, _this.apAddress[i].latitude);
                var marker = new BMap.Marker(spot);
                map.addOverlay(marker);
                console.log(_this.apAddress[i].longitude,_this.apAddress[i].latitude);
                marker.addEventListener("click",attribute)
                marker.selIdx = i;
            }
          }
        })
      }
     //获取覆盖物位置
     function attribute(e){
        var p = e.target;
        console.log(e.screenX+ ','+e.screenY);
        _this.maptips = {
          show: true,
          msg: '位置:'+_this.apAddress[p.selIdx].address,
          top: e.screenY-160,
          left: e.screenX-100,
        }
       // console.log("marker的位置是" + p.getPosition().lng + "," + p.getPosition().lat);
      }
    },
    refresh() {
      this.getData(false);
    },
    handleSizeChange(val) {
      console.log(`每页 ${val} 条`);
    },
    handleCurrentChange(val) {
      this.pageCfg.start = (val-1)*30;
      this.getData(false);
      console.log(`当前页: ${val}`);
    },
  }
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
.close-map {
    width: 20px;
    height: 20px;
    @include pos(top,20px,right,20px);
    background-color: rgba(0,0,0,0.5);
    z-indx:100;
}
</style>
