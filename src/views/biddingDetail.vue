<style scoped lang="less">
.search {
  width: 100%;
}
.projectInfoItem {
  height: 50px;
  line-height: 50px;
}
</style>
<template>
    <div class="index">
        <Card>
            <p slot="title">招标信息</p>
            <div class="projectInfoItem" v-for="(option, index) in projectInfo.project_info" :key="index">项目{{index + 1}}：<a @click="linkToProject(option.result_info_url)">{{option.project_name}}</a></div>
        </Card>
    </div>
</template>
<script>
    import { apiHost } from '../apiHost.js';
    import { urlencode } from '../utils/urlencode.js';
    export default {
        data () {
            return {
                projectInfo: {}
            }
        },
        created(){
           this.getProjectInfo()
        },
        methods: {
            getProjectInfo(){
                const that = this;
                this.$http.get(`${apiHost.CO_HOST}/company/${this.$route.params.id}`)
                .then(function (response) {
                    that.projectInfo = response.data.data.XCmdrResult;
                    console.log(response.data)
                })
                .catch(function (error) {
                    console.log(error);
                });
            },
            linkToProject(url){
                window.open(`http://www.ggzy.gov.cn/information${url}`.replace("/b/","/a/"));
            }
        }
    }
       
    
</script>
