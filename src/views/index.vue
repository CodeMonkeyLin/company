<style scoped lang="less">
</style>
<template>
    <div class="index">
        <Input search enter-button="Search" @on-search="Search" placeholder="Enter something..." />
        <Table :data="tableData" :columns="tableColumns" stripe></Table>
        <div style="margin: 10px;overflow: hidden">
            <div style="float: right;">
                <Page :total="100" :current="1" @on-change="changePage"></Page>
            </div>
        </div>
    </div>
</template>
<script>
    export default {
        data () {
            return {
                tableData: [],
                tableColumns: [{
                        title: 'company_code',
                        key: 'company_code'
                    },
                    {
                        title: 'company_name',
                        key: 'company_name',
                    },{
                        title: 'legal_person',
                        key: 'legal_person',
                    },{
                        title: 'manage_address',
                        key: 'manage_address',
                    },{
                        title: 'province_name',
                        key: 'province_name',
                    },{
                        title: 'city_name',
                        key: 'city_name',
                    },{
                        title: 'reg_address',
                        key: 'reg_address',
                    },]
            }
        },
        created(){
            this.getCompanyInfo()
        },
        methods: {
            changePage (e) {
                // The simulated data is changed directly here, and the actual usage scenario should fetch the data from the server
                this.getCompanyInfo(e)
            },
            getCompanyInfo(){
                const that = this;
                this.$http.get('http://127.0.0.1/company-list', {
                    params: {
                    
                    }
                })
                .then(function (response) {
                    that.tableData=response.data.XCmdrResult.data_list
                })
                .catch(function (error) {
                    console.log(error);
                });
            },
            Search (value) {
                alert(value)
            }
        }
    }
       
    
</script>
