<style scoped lang="less">
.search {
  width: 100%;
}
.searchItem {
  margin: 10px 10px !important;
  width: 500px;
  //   float: left;
}
</style>
<template>
    <div class="index">
        <div>
            <div class="searchItem">
                <Input search enter-button="Search" @on-change="ChangeSearchText" label-in-value @on-search="SearchText" placeholder="请输入企业名称、法人或经营地址" class="search" />
            </div>
            <div class="searchItem">
                <Cascader :data="qualificationList" @on-clear="ClearQualification" @on-change="SelectQualificationEnterprise" placeholder="请选择建筑资质"></Cascader>
            </div>
            <div class="searchItem">
                <Cascader change-on-select filterable :data="areaList" @on-change="SelectArea" placeholder="请选择城市或者省份（单选）"></Cascader>
            </div>
            <div class="searchItem">
                <Select v-model="model" multiple filterable remote :remote-method="remoteMethod" @on-change="SearchArea" :loading="loading" placeholder="请输入城市或者省份（可多选）">
                    <Option v-for="(option, index) in options" :value="option.value" :key="index">{{option.label}}</Option>
                </Select>
            </div>
            <div class="searchItem">
                <Button type="primary" @click="Search" :loading="searchLoading">搜索</Button>
                <Button @click="resetParams">重置</Button>
            </div>
        </div>

        <Table :data="tableData" :columns="tableColumns" stripe :loading="tableLoading"></Table>
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
                    page:1 
                },
                tableData: [],
                model: '',
                area_list: [],
                loading: true,
                searchLoading: false,
                tableLoading: true,
                options: [],
                total_page_count: 0,
                remoteArealist: [],
                qualificationList: [],
                areaList: [],
                tableColumns: [
                    {
                        title: '企业名称',
                        key: 'company_name',
                        width: 300
                    },{
                        title: '法人',
                        key: 'legal_person',
                        width: 100
                    },{
                        title: '企业经营地址',
                        key: 'manage_address',
                    },{
                        title: '省份',
                        key: 'province_name',
                        width: 150
                    },{
                        title: '地级市',
                        key: 'city_name',
                        width: 150
                    },{
                        title: '企业注册属地',
                        key: 'reg_address',
                        width: 150
                    },{
                        title: '建筑资质',
                        key: 'qualification_enterprise',
                        render:(h,params)=>{
                            if(params.row.qualification_enterprise.indexOf(this.searchParams.qualification_enterprise) >= 0){
                                params.row.qualification_enterprise.split(',').map(item=>{
                                    if(item.indexOf(this.searchParams.qualification_enterprise) >=0){
                                        // console.log(item.trim())
                                        
                                    }
                                })
                            };
                            return h('div', {
                                
                            }, [h('div',{
                                style:{
                                    padding: '10px'
                                }
                            },[...new Set( params.row.qualification_enterprise.split(','))].map(item => {
                                        if(this.searchParams.qualification_enterprise && item.indexOf(this.searchParams.qualification_enterprise) >=0){
                                            return h('span', {
                                                style: {
                                                    padding: '4px',
                                                    color: 'red',
                                                    listStyle:'none'
                                                }
                                            }, item + ',')
                                        }
                                        return h('span', {
                                            style: {
                                                padding: '4px',
                                                listStyle:'none'
                                            }
                                        }, item + ',')
                                    }))
                                ])
                        }
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
                that.remoteArealist = Object.values(response.data.data.XCmdrResult);
                that.loading =  false;
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
                    that.searchLoading = false;
                    that.tableLoading = false;
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
            ChangeSearchText(e) {
                this.searchParams.search_text = e.target.value;
            },
            SearchText (value) {
                this.tableLoading = true;
                this.searchParams.search_text = value;
                this.searchParams.page = 1;
                this.getCompanyInfo();
            },
            SelectArea(value,selectedData){
                if(selectedData.length){
                    this.searchParams.area = selectedData[selectedData.length-1].label;
                }
            },
            SearchArea(value){
                 this.searchParams.area_list = value;
            },
            SelectQualificationEnterprise(value,selectedData){
                if(selectedData.length){
                    this.searchParams.qualification_enterprise = selectedData[selectedData.length-1].label;
                }
            },
            Search(){
                this.searchLoading = true;
                this.tableLoading = true;
                this.searchParams.page = 1;
                this.getCompanyInfo();
            },
            ClearQualification(){
                this.searchParams.qualification_enterprise = '';
            },
            ClearArea(){
                this.searchParams.area = '';
            },
            remoteMethod(query){
                const that = this; 
                if (query !== '') {
                    // this.loading = true;     
                    setTimeout(()=>{
                        const list = that.remoteArealist.map(item => {
                            return {
                                value: item,
                                label: item
                            };
                        });  
                        that.options = list.filter(item => item.label.indexOf(query) >= 0)
                    },200)
                } else {
                    this.options = [];
                }
            },
            resetParams(){
                this.tableLoading = true;
                this.searchParams = {
                    page: 1
                }
                this.getCompanyInfo();
            }
        }
    }
       
    
</script>
