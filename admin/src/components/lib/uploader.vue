<template>
  <div id="container">
    <button id="selectfiles" class='btn btn-info pull-left right10'>选择文件</button>
    <label class="sex-margin" v-if="labelshow">
      <input type="radio" class="radio-sex sex-outline" :value="1" v-model="imgtype">图片</label>
    <label class="sex-margin" v-if="labelshow">
      <input type="radio" class="radio-sex sex-outline" :value="0" v-model="imgtype">banner</label>
    <button id="postfiles" class='btn btn-info pull-left right10' :disabled="filenames == ''">开始上传</button>
    <span id="ossfile"></span>
  </div>
</template>
<script>
import CGI from '../../lib/cgi.js'

var uploadName = [];
var obj = {};

export default {
  data() {
    return {
      filenames: [],
      prevnames:[],
      upDone: 0,
    }
  },
  props: {
    labelshow: Boolean
  },
  //如果编辑中有上传图片需求，在编辑框关闭时应清空已上传文件
  /*events: {
    'modal-close': function() {
      document.getElementById('ossfile').innerHTML = '';
      this.filenames = '';
      uploadName = '';
    }
  },*/
  mounted() {
    var self = this;
    //console.log(self.prevnames.length);
    CGI.loadScript(__CDN__ + '/js/plupload.2.1.2.min.js', 'uploadjs', () => {
      var uploader = new plupload.Uploader({
        runtimes: 'html5,flash,silverlight,html4',
        browse_button: 'selectfiles',
        multi_selection: false,
        container: document.getElementById('container'),
        flash_swf_url: 'lib/plupload-2.1.2/js/Moxie.swf',
        silverlight_xap_url: 'lib/plupload-2.1.2/js/Moxie.xap',
        url: 'http://oss.aliyuncs.com',
        init: {
          PostInit() {
            document.getElementById('postfiles').onclick = function() {
              // 这里偷懒少了超时逻辑，必要的时候补回来
              //self.filenames = makeParam(self.prevnames, self.filenames);
              self.prevnames = self.filenames;
              CGI.post(self.$store.state, 'get_oss_image_policy', {
                // debug: 1,
                formats: get_suffix(self.filenames)
              }, (resp) => {
                if (resp.errno === 0) {
                  obj = resp.data;
                  obj['names'].forEach(function(val) {
                    uploadName.push(val)
                  })
                  doUpload(uploader, 0);
                }
              })
              return false;
            };
          },

          FilesAdded(up, files) {
            //console.log(self.filenames.length + ','+self.upDone);
            if (self.filenames.length == self.upDone) {
              var inner = document.getElementById('ossfile').innerHTML = '';
              self.filenames = [];
              uploadName = [];
              self.$store.state.imgUrl = [];
              self.upDone = 0;
            }
            
            plupload.each(files, function(file) {
              document.getElementById('ossfile').innerHTML += '<div id="' + file.id + '">' + file.name + ' (' + plupload.formatSize(file.size) + ')<b></b>' + '<div class="progress"><div  class="progress-bar progress-bar-info progress-bar-striped" style="width: 0%"></div></div>' + '</div>';
              self.filenames.push(file.name);
            });
          },

          UploadProgress(up, file) {
            this.prog = true;
            var d = document.getElementById(file.id);
            d.getElementsByTagName('b')[0].innerHTML = '<span>' + file.percent + "%</span>";
            var prog = d.getElementsByTagName('div')[0];
            var progBar = prog.getElementsByTagName('div')[0]
            progBar.style.width = 2 * file.percent + 'px';
            progBar.setAttribute('aria-valuenow', file.percent);
          },

          FileUploaded(up, file, info) {
            if (info.status == 200) {
              document.getElementById(file.id).getElementsByTagName('b')[0].innerHTML = '完成';
              self.upDone++;
              if (self.filenames.length == self.upDone) {
                console.log(uploadName);
                uploadName.forEach(function(val, idx) {
                  uploadName[idx] = 'http://img.yunxingzh.com/' + val;
                })
                console.log(uploadName);
                self.$store.state.imgUrl = uploadName;                
              } else {
                doUpload(uploader, self.upDone);
              }
            } else {
              //self.upDone = false;
              document.getElementById(file.id).getElementsByTagName('b')[0].innerHTML = info.response;
            }
          },
          Error(up, err) {
            document.getElementById('console').appendChild(document.createTextNode("\nError xml:" + err.response));
          }
        }
      });
      uploader.init();
    })
  }
}

function doUpload(uploader, idx) {
  var new_multipart_params = {
    'key': uploadName[idx],
    'policy': obj['policy'],
    'OSSAccessKeyId': obj['accessid'],
    'success_action_status': '200', //让服务端返回200,不然，默认会返回204
    'callback': obj['callback'],
    'signature': obj['signature'],
  };
  uploader.setOption({
    'url': obj['host'],
    'multipart_params': new_multipart_params
  });
  uploader.start();            
}

function get_suffix(filenames) {
  var pos,file;
  var suffix = [];
  filenames.forEach(function(val) {
    pos = val.lastIndexOf('.');
    if (pos != -1) {
      file = val.substring(pos + 1);
      suffix.push(file);
    }
  });
  return suffix;
}
// function makeParam(oldVal, newVal) {
//   console.log(oldVal.length);
//   for (var i=0; i<oldVal.length; i++) {
//     for(var j=0; j<newVal.length; j++) {
//       console.log(newVal[j] + oldVal[i]);
//       if (newVal[j] == oldVal[i]) {
//         oldVal.splice(j, 1);
//       }
//     }
//   }
//   return newVal;
// }
</script>
<style>
#container {
  /* padding: 0 15px; */
  display: flex;
  justify-content: flex-start;
  align-items: center;
}

.right10 {
  margin-right: 10px;
}

.progress {
  margin-bottom: 0;
  height: 14px;
  width: 200px;
}

#ossfile {
  height: auto;
  padding: 10px;
  background-color: #fff;
}
</style>
