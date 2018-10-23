<style scoped lang="less">
.search {
  width: 80%;
}
</style>
<template>
    <div class="index">
        <Input search enter-button="Search" @on-search="Search" placeholder="请输入企业名称或法人" class="search" />
        <Cascader :data="qualificationList" placeholder="请选择建筑资质"></Cascader>
        <!-- <Cascader change-on-select filterable :data="areaList" @on-change="SelectArea"></Cascader> -->
        <Select v-model="model" multiple filterable remote :remote-method="remoteMethod" @on-change="SearchArea" :loading="loading" placeholder="请选择城市或者省份（可多选）">
            <Option v-for="(option, index) in options" :value="option.value" :key="index">{{option.label}}</Option>
        </Select>
        <Table :data="tableData" :columns="tableColumns" stripe></Table>
        <div style="margin: 10px;overflow: hidden">
            <div style="float: right;">
                <Page :total="total_page_count" :current="searchParams.page" @on-change="changePage"></Page>
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
                    page:1 
                },
                tableData: [],
                model: '',
                loading: false,
                options: [],
                total_page_count: 0,
                remoteArealist: [],
                qualificationList: [],
                areaList: [],
                tableColumns: [
                    {
                        title: '企业名称',
                        key: 'company_name',
                    },{
                        title: '法人',
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
                    },{
                        title: '建筑资质',
                        key:'qualification_enterprise'
                    }]
            }
        },
        created(){
            const that = this;
            this.getCompanyInfo();
            this.getArea();
            this.getQualification();
            this.$http.get('http://127.0.0.1/area-list')
            .then(function (response) {
                that.remoteArealist = response.data.data.XCmdrResult.map(item => item.long_name);
                })
                .catch(function (error) {
                    console.log(error);
                });
        },
        methods: {
            changePage (page) {
                // The simulated data is changed directly here, and the actual usage scenario should fetch the data from the server
                this.searchParams.page = page;
                this.getCompanyInfo();
                
            },
            getCompanyInfo(){
                const that = this;
                this.$http.get('http://127.0.0.1/company-list', {
                    params:that.searchParams
                })
                .then(function (response) {
                    that.tableData = response.data.data.XCmdrResult.data_list;
                    that.total_page_count = response.data.data.XCmdrResult.total_page_count;
                })
                .catch(function (error) {
                    console.log(error);
                });
            },
            getArea(){
                const that = this;
                this.$http.get('https://resources.zhgcloud.com/areas/web-tree')
                .then(function (response) {
                    that.areaList = response.data.XCmdrResult.map(item=>{
                        return {
                            value: item.value,
                            label: item.label,
                            children:item.children[0].children ? item.children.map(r=>{
                                return { value:r.value,label:r.label}
                            }): []
                        }
                    }) || [];
                })
                .catch(function (error) {
                    console.log(error);
                });
            },
            getQualification(){
                const that = this;
                this.$http.get('http://127.0.0.1/company-qualification')
                .then(function (response) {
                    that.qualificationList = response.data.data.XCmdrResult;
                })
                .catch(function (error) {
                    console.log(error);
                });
            },
            Search (value) {
                this.searchParams.search_text = search_text;
                this.searchParams.page = 1;
                this.getCompanyInfo();
            },
            // SelectArea(value,selectedData){
            //     this.searchParams.area = selectedData[selectedData.length-1].label;
            // },
            SearchArea(value,selectedData){
                console.log(value,selectedData)
            },
            remoteMethod(query){
                const that = this; 
                if (query !== '') {
                    this.loading = true;
                    setTimeout(() => {
                        this.loading = false;
                        const list = that.remoteArealist.map(item => {
                            return {
                                value: item,
                                label: item
                            };
                        });  
                        that.options = list.filter(item => item.label.indexOf(query) >= 0)
                    }, 200);
                } else {
                    this.options = [];
                }
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
