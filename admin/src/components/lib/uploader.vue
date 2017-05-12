<template>
  <div id="container">
    <label class="sex-margin" v-if="labelshow">
    <input type="radio" class="radio-sex sex-outline" :value="1" v-model="imgtype">图片</label>
    <label class="sex-margin" v-if="labelshow">
      <input type="radio" class="radio-sex sex-outline" :value="0" v-model="imgtype">banner</label>
    <input type="file" id="file"/>
    <div id="upload_file" class='btn btn-info pull-left right10' @click="postFile">开始上传</div>
    <span id="ossfile"></span>
  </div>
</template>
<script>
import CGI from '../../lib/cgi.js'
var ajax = require('../../lib/ajax.js')

var uploadName = '';
var obj = {};

export default {
  data() {
    return {
      filenames: '',
      prevnames:'',
      upDone: 0,
      size: 0
    }
  },
  props: {
    labelshow: Boolean
  },
  mounted() {
    var self = this;
  },
  methods: {
    postFile() {
      var file = document.getElementById("file").files[0]  //文件对象
      var formData = new FormData();
      formData.append("file", file);
      formData.append("name", file.name);

      CGI.postform(this.$store.state, 'upload_img', formData, (resp) => {
          var obj = resp.data;
          var name = obj['filename']
          this.$store.state.imgUrl = name
      })
    },
  }
}

function get_suffix(filenames) {
  var suffix = '';
  var pos = filenames.lastIndexOf('.');
  if (pos != -1) {
    suffix = filenames.substring(pos + 1);
  }
  return suffix;
}
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
