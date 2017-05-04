<template>
  <div class="mana_container">
    <article class="module width_3_quarter">
      <div class="upload-img-box">
        <uploader></uploader>
        <div class="container-flow">
          <div>图片地址：</div>
          <p class="up-img" v-for="img in imgUrl">{{img}}</p>
        </div>
      </div>
    </article>
  </div>
</template>
<script>
  import uploader from '../lib/uploader.vue'
  import CGI from '../../lib/cgi.js'

  export default{
    data(){
      return {

      }
    },
    components: {
      uploader,
    },
    computed: {
      imgUrl() {
        return this.$store.state.imgUrl
      }
    }
  }
</script>
<style>
  .upload-img-box {
    padding: 20px 50px;
  }
  .upload-img-box .container-flow {
    margin-top: 20px;
  }
  .up-img {
    margin:  0;
  }
</style>
