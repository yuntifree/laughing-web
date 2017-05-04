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
.chart {
  width: 800px;
  height: 440px;
  background-color: #fff;
  margin-top: 5px;
}
</style>
<template>
  <div class="mana_container">
    <article class="module width_3_quarter">
      <header class="app_header">
        <div>
          <button class="btn btn-default btn-ssm" @click="dataLoad()">刷新</button>
        </div>
      </header>
      <div class="tab_container" ref="tableContent">
        <div class="chart" ref="chart"></div>
      </div>
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
var chartInst;
var chartOption = {
  title : {
    text: '接口统计信息',
    x: 'center',
    align: 'right'
  },
  color: ['#47b23c','#9de978','#da44eb','#edbcdb','#ff8f00','#efd79f'],
  grid: {
    bottom: 80,
    y: 100,
  },
  toolbox: {
    feature: {
      dataZoom: {
          yAxisIndex: 'none'
      },
      restore: {},
      saveAsImage: {}
    }
  },
  tooltip : {
    trigger: 'axis',
    axisPointer: {
      type: 'cross',
      animation: false,
      label: {
          backgroundColor: '#505765'
      }
    }
  },
  legend: {
      data:['get_check_code 请求次数',
      'get_check_code 失败率(%)',
      'portal_login 请求次数',
      'portal_login 失败率(%)',
      'one_click_login 请求次数',
      'one_click_login 失败率(%)'],
      top: 30,
      selectedMode: 'multiple'
    },
  dataZoom: [
    {
      show: true,
      realtime: true,
      start: 65,
      end: 85
    },
    {
      type: 'inside',
      realtime: true,
      start: 65,
      end: 85
    }
  ],
  xAxis : [
    {
      type : 'category',
      boundaryGap : false,
      axisLine: {onZero: false},
      data : []
    }
  ],
  yAxis: [
    {
      name: '次数：次',
      type: 'value'
    },
    {
      name: '失败率：%',
      type: 'value',
      min: 0,
      max: 100
    }
  ],
  series: [
    {
      name:'get_check_code 请求次数',
      type:'line',
      smooth: true,
      symbol: 'circle',
      symbolSize : 8,
      animation: false,
      lineStyle: {
          normal: {
              width: 1,
          }
      },    
      data:[]
    },
    {
      name:'get_check_code 失败率(%)',
      type:'line',
      smooth: true,
      symbol: 'arrow',
      symbolSize : 8,
      animation: false,
      yAxisIndex:1,
      lineStyle: {
          normal: {
              width: 1,
          }
      },    
      data:[]
    },
        {
      name:'portal_login 请求次数',
      type:'line',
      smooth: true,
      symbol: 'rect',
      symbolSize : 8,
      animation: false,
      lineStyle: {
          normal: {
              width: 1,
          }
      },    
      data:[]
    },
    {
      name:'portal_login 失败率(%)',
      type:'line',
      smooth: true,
      symbol: 'roundRect',
      symbolSize : 8,
      animation: false,
      yAxisIndex:1,
      lineStyle: {
          normal: {
              width: 1,
          }
      },    
      data:[]
    },
        {
      name:'one_click_login 请求次数',
      type:'line',
      smooth: true,
      symbol: 'triangle',
      symbolSize : 8,
      animation: false,
      lineStyle: {
          normal: {
              width: 1,
          }
      },    
      data:[]
    },
    {
      name:'one_click_login 失败率(%)',
      type:'line',
      smooth: true,
      symbol: 'diamond',
      symbolSize : 8,
      symbolColor: '#efd79f', 
      animation: false,
      yAxisIndex:1,
      lineStyle: {
          normal: {
              width: 1,
          }
      },    
      data:[]
    }
  ]
};


export default {
  data() {
    return {
      dataReady: true,
      infos: [],
      modal: {
        dialogShow: false,
        addShow: false,
      },
      dialogCfg: {
        title: '',
        text: '',
      },
      pageCfg: {
        start: 0,
      },
      selId: -1,
      selected: {
        name: 'get_check_code'
      },
      tagsInfo: [],
      checkedTags: [],
      postInfo: {
        dir: '',
        description: ''
      },
      dateInfo: {
        date1: '',
        date2: ''
      },
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
    CGI.loadScript('https://cdn.bootcss.com/echarts/3.5.4/echarts.common.min.js', 'chartjs', ()=>{
      chartInst = echarts.init(this.$refs.chart);
    })
    this.dataLoad();
  },
  methods: {
    dataLoad() {
      this.getData(true, 'get_check_code');
      this.getData(true, 'portal_login');
      this.getData(true, 'one_click_login');
    },
    getData(reload,name) {
      if (reload) {
        this.pageCfg.start = 0;
      }
      var param = {
        seq: this.pageCfg.start,
        num: 60,
        name: name
      }
      CGI.post(this.$store.state, 'get_api_stat', param, (resp) => {
        if (resp.errno === 0) {
          var data = resp.data;
          switch (name) {
            case 'get_check_code': 
              data.infos.forEach(function(item){
                item.ctime = item.ctime.replace(' ', '\n')
                chartOption.xAxis[0].data.unshift(item.ctime);
                chartOption.series[0].data.unshift(item.req);
                var fail = (((item.req-item.succrsp)/item.req)*100).toFixed(2);
                fail = fail < 0 ? 0 : fail;
                chartOption.series[1].data.unshift(fail);
              })
              break;
            case 'portal_login':
              data.infos.forEach(function(item){
                chartOption.series[2].data.unshift(item.req);
                var fail = (((item.req-item.succrsp)/item.req)*100).toFixed(2);
                fail = fail < 0 ? 0 : fail;
                chartOption.series[3].data.unshift(fail);
              })
              break;
            case 'one_click_login':
              data.infos.forEach(function(item){
                chartOption.series[4].data.unshift(item.req);
                var fail = (((item.req-item.succrsp)/item.req)*100).toFixed(2);
                fail = fail < 0 ? 0 : fail;
                chartOption.series[5].data.unshift(fail);
              })
              break;
          }
          chartInst.setOption(chartOption);
          this.dataReady = true;
        } else {
          this.alertInfo(resp.desc);
        }
      });
    },
    alertInfo(val) {
      this.alertShow = true;
      this.alertMsg = val; 
    }
  }
}
</script>
