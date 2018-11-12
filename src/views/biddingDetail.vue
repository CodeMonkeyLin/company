<style scoped lang="less">
.search {
  width: 100%;
}
.projectInfoItem {
  height: 50px;
  line-height: 50px;
  span {
    color: black;
  }
}
.date {
  float: right;
  margin-right: 100px;
}
</style>
<template>
    <div class="index">
        <Card>
            <p slot="title">企业信息</p>
            <p class="projectInfoItem"><span>公司名称：</span>{{projectInfo.company_name}}</p>
            <p class="projectInfoItem"><span>公司地址：</span>{{projectInfo.manage_address}}</p>
            <p class="projectInfoItem"><span>公司法人：</span>{{projectInfo.legal_person}}</p>
            <p style="line-height: 50px;"><span style="color: black;">公司建筑资质：</span>{{projectInfo.qualification_enterprise}}</p>
        </Card>
        <Card>
            <p slot="title">招标信息</p>
            <div class="projectInfoItem" v-for="(option, index) in projectInfo.project_info" :key="index"><span>项目{{index + 1}}：</span><a @click="linkToProject(option.result_info_url)">{{option.project_name}}</a> <span class="date">公示时间：<a>{{option.date}}</a></span></div>
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
