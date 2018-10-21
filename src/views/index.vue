<style scoped lang="less">
.search {
  width: 80%;
}
</style>
<template>
    <div class="index">
        <Input search enter-button="Search" @on-search="Search" placeholder="Enter something..." class="search" />
        <Table :data="tableData" :columns="tableColumns" stripe></Table>
        <div style="margin: 10px;overflow: hidden">
            <div style="float: right;">
                <Page :total="100" :current="searchParams.page" @on-change="changePage"></Page>
            </div>
        </div>
    </div>
</template>
<script>
    export default {
        data () {
            return {
                searchParams: {
                    search_text: '',
                    page:''
                },
                ss: 1,
                tableData: [],
                tableColumns: [{
                        title: '企业代码',
                        key: 'company_code'
                    },
                    {
                        title: '企业名称',
                        key: 'company_name',
                    },{
                        title: '企业法定代表人',
                        key: 'legal_person',
                    },{
                        title: '企业经营地址',
                        key: 'manage_address',
                    },{
                        title: '省份',
                        key: 'province_name',
                    },{
                        title: '地级市',
                        key: 'city_name',
                    },{
                        title: '企业注册属地',
                        key: 'reg_address',
                    },]
            }
        },
        created(){
            this.getCompanyInfo()
        },
        methods: {
            changePage (page) {
                // The simulated data is changed directly here, and the actual usage scenario should fetch the data from the server
                this.searchParams.page = page;
                this.getCompanyInfo();
            },
            getCompanyInfo(){
                const that = this;
                console.log(that.searchParams)
                this.$http.get('http://127.0.0.1/company-list', {
                    params:that.searchParams
                })
                .then(function (response) {
                    that.tableData=response.data.XCmdrResult.data_list
                })
                .catch(function (error) {
                    console.log(error);
                });
            },
            Search (value) {
                this.searchParams = { search_text: value, page: 1};
                this.getCompanyInfo();
            },
            resetParams(){
                this.searchParams = {
                    search_text: '',
                    page:''
                }
            }
        }
    }
       
    
</script>
